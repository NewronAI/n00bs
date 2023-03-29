import NextExpress from "@/helpers/node/NextExpress";

const createFakeDataApi = new NextExpress();

import {db} from "@/helpers/node/db";
import chance from "chance";
import {file_type, member_role, obj_status, question_type} from "@prisma/client";


const enabled = false;
createFakeDataApi.get(async (req, res) => {

    if (!enabled) {
        res.status(200).json({
            message: "Disabled"
        });
        return;
    }

    const memberCount = 100;
    const enableMemberCreation = false;
    const questionCount = 10;
    const enableQuestionCreation = false;
    const fileCount = 1000;
    const enableFileCreation = false;
    const taskCount = 10;
    const enableTaskCreation = false
    const taskAssignmentCount = 1000;
    const enableTaskAssignmentCreation = false;
    const taskAnswerCount = 500;

    const c = new chance.Chance();


    // Create workflow
    await db.workflow.upsert({
        where: {
            id: 1
        },
        update: {},
        create: {
            name: "Manual QC - Single Audio",
            desc: "This workflow is used to manually QC single audio files",
        }
    });

    // Create users
    for (let i = 0; i < memberCount && enableMemberCreation; i++) {
        await db.member.upsert({
            where: {id: i},
            update: {},
            create: {
                name: c.name(),
                email: c.email(),
                phone: c.phone(),
                role: c.pickone(Object.values(member_role)),
                status: c.pickone(Object.values(obj_status)),
                district: c.city(),
                state: c.state(),
                address: c.address(),
                pincode: c.zip(),
                payment_details: {
                    bank_name: c.company(),
                    account_number: c.zip(),
                    ifsc_code: c.zip(),
                    account_holder_name: c.name(),
                },
            },
        });

    }

    for (let i = 0; i < fileCount && enableFileCreation; i++) {
        // Create workflow files
        await db.workflow_file.upsert({
            where: {id: i},
            update: {},
            create: {
                file_type: c.pickone(Object.values(file_type)),
                file: c.url(),
                file_name: c.word(),
                status: c.pickone(Object.values(obj_status)),
                workflow: {
                    connect: {
                        id: 1
                    }
                },
                file_duration: c.integer({min: 10, max: 100}),
                district: c.city(),
                state: c.state(),
            }
        });
    }

    for (let i = 0; i < questionCount && enableQuestionCreation; i++) {
        // Create Questions
        await db.question.upsert({
            where: {id: i},
            update: {},
            create: {
                name: c.sentence(),
                text: c.sentence(),
                order: c.integer({min: 1, max: 10}),
                required: c.bool(),
                question_type: c.pickone(Object.values(question_type)),
                options: c.pickset([c.word(), c.word(), c.word(), c.word(), c.word()], c.integer({min: 2, max: 5})),
                status: c.pickone(Object.values(obj_status)),
            }
        });

    }


    for (let i = 0; i < taskCount && enableTaskCreation; i++) {

        const questions = new Array(c.integer({min: 1, max: 7})).fill(0).map(() => {
            return {
                question: {
                    connect: {
                        id: c.integer({min: 1, max: questionCount})
                    }
                }
            }
        });

        // Create tasks
        await db.task.upsert({
            where: {id: i},
            update: {},
            create: {
                name: c.word(),
                task_question_id: c.integer({min: 1, max: questionCount}),
                status: c.pickone(Object.values(obj_status)),
                workflow: {
                    connect: {
                        id: 1
                    }
                },
                min_assignments: 3,
                district: c.city(),
                state: c.state(),
                task_questions: {
                    create: [
                        ...questions
                    ]
                }
            }
        });
    }


    for (let i = 0; i < taskAssignmentCount && enableTaskAssignmentCreation; i++) {
// Create task assignments
        try {
            await db.task_assignment.upsert({
                where: {id: i},
                update: {},
                create: {
                    name: c.word(),
                    status: c.pickone(Object.values(obj_status)),
                    task_definitions: {
                        connect: {
                            id: c.integer({min: 1, max: taskCount})
                        }
                    },
                    workflow_file: {
                        connect: {
                            id: c.integer({min: 1, max: fileCount})
                        }
                    }
                }
            });
        } catch (e) {
            console.log(e);
        }
    }


    // for (let i = 0; i < taskAnswerCount; i++) {
    //     // Create task answers
    //     await db.task_answer.upsert({
    //         where: {id: i},
    //         update: {},
    //         create: {
    //             name: c.word(),
    //             status: c.pickone(Object.values(obj_status)),
    //             task: {
    //                 connect: {
    //                     id: c.integer({min: 1, max: taskAssignmentCount})
    //                 }
    //             },
    //             questions: {
    //                 connect: {
    //                     id: c.integer({min: 1, max: questionCount})
    //                 }
    //             },
    //             answer: c.sentence()
    //         }
    //     }
    // }




    res.status(200).json({message: "success"});

});

export default createFakeDataApi.handler;