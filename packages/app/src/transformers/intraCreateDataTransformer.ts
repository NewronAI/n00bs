
const transformationMap = new Map<string,string>();
transformationMap.set("Audio 2", "file_name");
transformationMap.set("Audio link", "file");
transformationMap.set("Cosine similarity", "cosine_similarity");
transformationMap.set("Reference sample", "is_reference");



const intraCreateDataTransformer = (header: string, _index: number) => {

    const transformation = transformationMap.get(header);
    if (transformation) {
        return transformation;
    } else {
        return header;
    }

}

export default intraCreateDataTransformer;