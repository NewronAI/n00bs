import {Prisma} from "@prisma/client";

const minGroupAssignment = 5;
const targetPercentage = 0.8;
const findCurrentIndex = (files : any[], groupSize : number ) => {

    if(groupSize < minGroupAssignment) throw new Error("Group size must be greater than 5");

    console.log("files present",files.length);

    for(let i = 0; i < files.length; i += groupSize){
        let groupPositiveCount = 0;
        console.log("i",i);

        for(let j = 0; j < minGroupAssignment; j++){

            console.log("j",j);

            if(i+j >= files.length) {
                return null;
            }
            if(files[i + j].is_similar === true){
                groupPositiveCount++;
            }
        }

        let isGroupEvaluated = groupPositiveCount / minGroupAssignment > targetPercentage;

        if(!isGroupEvaluated) {

            console.log("isGroupEvaluated",isGroupEvaluated);

            for(let j = 0; j < minGroupAssignment; j++) {
                if(i+j >= files.length) {

                    console.log("i+j >= files.length",i+j >= files.length);

                    return null;
                }
                if(files[i + j].is_similar === null){

                    console.log("i + j",i + j);

                    return i + j;
                }
            }
        }

    }

}
const intraFileLogic = (files : any[], groupSize : number ) => {

    const currentIndex = findCurrentIndex(files, groupSize);

    if(currentIndex === null || currentIndex === undefined) {
        return null;
    }

    return files[currentIndex];

};
export default intraFileLogic;