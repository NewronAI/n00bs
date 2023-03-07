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
        else {
            console.log("isGroupEvaluated",isGroupEvaluated);
            return -1;
        }

    }

}
const intraFileLogic = (files : any[], groupSize : number ) => {

    const currentIndex = findCurrentIndex(files, groupSize);

    if(currentIndex === null || currentIndex === undefined || currentIndex === -1) {
        return null;
    }

    return files[currentIndex];

};

export const isThresholdFound = (files : any[], groupSize : number ) => {

        const currentIndex = findCurrentIndex(files, groupSize);

        console.log("currentIndex",currentIndex);

        if(currentIndex === -1) {
            return true;
        }

        return false;
}

export const calculateCosineThreshold = (files : any[], group : number = 5, min_reqd = 4 ) => {
    // sliding window of size 5 and 80% of the files in the window should be similar

    let cosineThreshold = 1;

    for(let i = 0; i < files.length; i += group){
        let groupPositiveCount = 0;
        for(let j = 0; j < group; j++){
            if(i+j >= files.length) {
                break;
            }
            if(files[i + j].is_similar === true){
                groupPositiveCount++;
            }
        }
        if(groupPositiveCount >= min_reqd) {
            cosineThreshold = files[i].cosine_score;
        }
    }

    return cosineThreshold;

}

export default intraFileLogic;