

//Text-based AI Chat Message Controller

import Chat from "../models/Chat.js"

export const textMessageController = async(req, res) => {
    try {
        const userId = req.user._id
        const {chatId, prompt} = req.body
        const chat = await Chat.findOne({userId, _id:chatId})
    } catch (error) {
        
    }
}