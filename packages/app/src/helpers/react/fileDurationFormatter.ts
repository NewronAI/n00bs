import moment from "moment/moment";

const fileDurationFormatter = (params : {value : number}) => {
    return params.value < 60 ?
        `${params.value} sec`
        : params.value < 3600 ?
            `${moment.duration(params.value, "second").asMinutes().toFixed(1)} min` :
            `${moment.duration(params.value, "second").asHours().toFixed(1)} hrs`;
};


export default fileDurationFormatter;