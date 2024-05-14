import request from '@/utils/request'

const api_name = '/user'

export default {
    getAnnouncement() {
        return request({
            url: `${api_name}/announcement`,
            method: 'get'
        })
    },
    getQuestion() {
        return request({
            url: `${api_name}/question`,
            method: 'get'
        })
    },
    updateAnnouncement(imgsToBeRemoved, imgsToBeUploaded, announcement) {
        const formData = new FormData();

        imgsToBeUploaded.forEach((img) => {
            formData.append('imgs', img);
        });

        if (imgsToBeRemoved !== null) {
            formData.append('removal', JSON.stringify(imgsToBeRemoved));
        }

        formData.append('announcement', JSON.stringify(announcement));

        return request({
            url: '/admin/announcement/update',
            method: 'post',
            data: formData
        })
    },

    deleteThread(announcement) {
        return request({
            url: '/admin/announcement/delete',
            method: 'post',
            data: announcement
        })
    },

    updateQuestion(qImagesRemoval, aImagesRemoval, qAddedImages, aAddedImages, question) {
        const formData = new FormData();

        qAddedImages.forEach((img) => {
            formData.append('qAddedImages', img);
        });

        aAddedImages.forEach((img) => {
            formData.append('aAddedImages', img);
        });

        if (qImagesRemoval !== null) {
            formData.append('qImagesRemoval', JSON.stringify(qImagesRemoval));
        }

        if (aImagesRemoval !== null) {
            formData.append('aImagesRemoval', JSON.stringify(aImagesRemoval));
        }

        formData.append('question', JSON.stringify(question));

        return request({
            url: '/admin/question/update',
            method: 'post',
            data: formData
        })
    },

    saveQuestion(qAddedImages, quesiton) {
        const formData = new FormData();

        qAddedImages.forEach((img) => {
            formData.append('qAddedImages', img);
        });

        formData.append('question', JSON.stringify(quesiton));

        return request({
            url: `${api_name}/question/save`,
            method: 'post',
            data: formData
        })
    },
    removeQuestion(question) {
        return request({
            url: '/admin/question/delete',
            method: 'post',
            data: question
        })
    },
}