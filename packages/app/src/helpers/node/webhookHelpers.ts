import { sendTextMessage, sendQuestion, sendInteractiveMessage } from "src/messageHelper";
import { db } from "@/helpers/node/db";
import assertUp from "./assert/assertUp";
import { check_type } from "@prisma/client";

async function clearSessionData(session: any) {
    try {
        const clearedSession = await db.user_session.update({
            where: { id: session.id },
            data: {
              current_question: { disconnect: true },
              task_assignments: { disconnect: true },
            },
          });

          const updatedSession = await db.user_session.update({
            where: { id: session.id },
            data: {
              current_question_uuid: null,
              task_assignment_id: null,
              responses: {},
            },
          });
          console.log("Cleared Session", updatedSession);
    } catch(e) {
        console.log(e);
        console.log("Couldnt clear the session, ERROR:", e);
        return;
    }
}

export async function handleHiResponse(waID: any, assigneDetails: any, session: any) {

    await clearSessionData(session);

    console.log("sending hi response", waID, assigneDetails);

    await sendTextMessage(waID, `Welcome ${assigneDetails.name}!`);
    console.log("welcome message sent");

    const workflows = await db.workflow.findMany({
        include: {
            tasks: true
        },
        orderBy: {
            id: "asc"
        }
    });
    console.log("fetched workflows");

    const dataFetchPromises = workflows.map(async (flow: { tasks: { id: any; }[]; }) => {
        return db.task_assignment.count({
            where: {
                task_id: flow.tasks[0].id,
                assignee_id: assigneDetails.id,
                status: "pending"
            }
        })
    });

    const countValues = await Promise.all(dataFetchPromises);
    console.log("fetched all counts");

    const toSendMessage = `You have following number of tasks:\n\n${workflows.map(({ name }: any, index: any) => {
        return `${name}  : ${countValues[index]}`
    }).join("\n")}`;

    const buttons = workflows.map((flow: { id: number; }) => {
        return {
            type: "reply",
            reply: {
                title: flow.id === 1 ? "Single Audio Check" : "District Audio Check",
                id: JSON.stringify({ type: "WF", wfID: flow.id }),
            }
        }
    });

    await sendInteractiveMessage(waID, {
        body: {
            text: toSendMessage
        },
        type: "button",
        action: {
            buttons: buttons
        }
    });

    console.log("sent user count");

}

async function getTaskAssingment(workflowID: number, assigneeID: any) {
    const task_assignment = await db.task_assignment.findFirst({
        where: {
            assignee_id: assigneeID,
            status: "pending",
            task: {
                workflow_id: workflowID,
            }
        },
        select: {
            id: true,
            workflow_file: {
                select: {
                    uuid: true,
                    file_name: true,
                    file: true,
                }
            }
        }
    })

    return task_assignment;
}

async function getQuestions(wfID: number, task_assignmentID: any) {
    const taskQuestions = await db.task_assignment.findFirst({
        where: {
            id: task_assignmentID
        },
        select: {
            task: {
                select: {
                    task_questions: {
                        select: {
                            questions: {
                                select: {
                                    id: true,
                                    name: true,
                                    uuid: true,
                                    expected_answer: true,
                                    text: true,
                                    question_type: true,
                                    options: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    const questions = taskQuestions?.task.task_questions.map((question: { questions: any; }) => {
        return question.questions
    })

    return questions;
}

async function updateSession(responses: any, sessionID: any, current_question_uuid: string) {
    await db.user_session.update({
        where: {
            id: sessionID,
        },
        data: {
            responses,
            current_question_uuid
        }
    })
}

export async function handleWFResponse(messageId: any, session: any, waID: number) {

    console.log("Workflow Id got ----------------------------------------------------", messageId.wfID)
    console.log("Check type", session.check_type)
    const task_assignment = await getTaskAssingment(messageId.wfID, session.member_id)
    if(!task_assignment) {
        await sendTextMessage(waID, `You have no assingments from ${session.check_type.replace(/_/g, " ")}`)
        return;
    }

    const questions = await getQuestions(messageId.wfID, task_assignment?.id);
    if (!questions) {
        assertUp(questions, {
            message: "Could Not fetch the questions",
            status: 400
        })
        return;
    }
    let responseJSON: { [key: string]: string } = {};
    questions.map((question: { uuid: string | number; }) => {
        responseJSON[question.uuid] = "null";
    });

    const checkType = messageId.waID === 1 ? check_type.single_audio : messageId.waID === 2 ? check_type.district_wise_audio : null;

    await db.user_session.update({
        where: {
            id: session.id,
        },
        data: {
            task_assignment_id: task_assignment?.id,
            responses: responseJSON,
            current_question_uuid: questions[0].uuid,
            check_type: checkType,
        }
    });

    await sendTextMessage(waID, `File Name - ${task_assignment?.workflow_file.file_name.split("/").pop()}\n\n Please visit the below link to view the file\n\n${task_assignment?.workflow_file.file}`)
    await sendQuestion(waID, questions[0].text, questions[0].options, questions[0].uuid, questions[0].expected_answer, messageId.wfID);
}

export async function handleQuestionResponses(messageId: any, session: any, waID: number, textBody: any) {
    console.log("Current Question UUID: ",session.current_question_uuid);
    console.log("Recived answer question UUID: ",messageId.questionUUID);
    if(session.current_question_uuid !== messageId.questionUUID) {
        console.log("Couldn't match the question uuid")
        await sendTextMessage("Please answer the current question only.")
        return;
    }
    if (messageId.expectedAns === textBody || messageId.wfID === 2 || messageId.expectedAns === "") {
        console.log("Answer recieved is expected answer")
        const task_assignment_id = session.task_assignment_id
        const response = session.responses;
        response[messageId.questionUUID] = textBody;
        const questions = await getQuestions(messageId.wfID, task_assignment_id)
        const filteredQuestions = questions?.filter((question: { uuid: string | number; }) => {
            if (response[question.uuid] === "null") {
                return question;
            }
        })
        if (!filteredQuestions) {
            return
        }

        const updatedSesssion = await updateSession(response, session.id, filteredQuestions[0].uuid)

        if(filteredQuestions.length === 1 && filteredQuestions[0].name.slice(0,8) === "Comments") {
            await sendTextMessage(waID, filteredQuestions[0].text)
            return;
        }
        await sendQuestion(waID, filteredQuestions[0].text, filteredQuestions[0].options, filteredQuestions[0].uuid, filteredQuestions[0].expected_answer, messageId.wfID);
    }
}

// async function updateTask(session: any) {
//     const taskFinished = await db.task_answer.update({
//         where: {

//         },
//         data: {

//         }
//     })
// }

export async function handleCommentResponse(waID: string, session: any, textBody: string) {
    const questions = await getQuestions(1, session.task_assignment_id)
    console.log("Question :", questions)

    const question = await db.question.findFirst({
        where: {
            uuid: session.current_question_uuid,
        },
        select: {
            question_type: true,
            text: true,
            name: true,
            uuid: true,
            id: true
        }
    })

    console.log("Question type", question?.question_type)
    if(question?.question_type !== "text") {
        console.log("Comments question type is different than expected. Question ID", question?.text, question?.question_type)
        await sendTextMessage(waID, "Please select from the options")
        return false;
    }

    console.log("Last question", question?.question_type)
    const response = session.responses;
    response[session.current_question_uuid] = textBody;
    console.log("Responses", response)

    const upddatedSession = await db.user_session.update({
        where: {
            id: session.id,
        },
        data: {
            responses: response
        }
    })
    return true;
}

export async function checkResponseTime(session: any) {
    const lastUpdate = session.updatedAt;
    const currentDateTime = new Date();

    if (lastUpdate) {
      const differenceInMinutes = Math.floor(Math.abs(currentDateTime.getTime() - lastUpdate.getTime()) / (1000 * 60));
      console.log("lastUpdate", lastUpdate);
      console.log("currentDateTime", currentDateTime);
      console.log("differenceInMinutes", differenceInMinutes);

      if (differenceInMinutes <= 15) {
        return true;
      } else {
        await clearSessionData(session);
        return false;
      }
    } else {
      // Handle the case when lastUpdate is null
      // For example, return false or perform some other logic
      return true;
    }

}