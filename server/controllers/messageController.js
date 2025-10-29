import Chat from "../models/Chat.js"
import User from "../models/User.js"
import axios from "axios"
import imagekit from "../configs/imagekit.js"
//Text-based AI Chat Message Controller
export const textMessageController = async(req, res) => {
    try {
        const userId = req.user._id
        //Check credits
          if(req.user.credits<2){
            return res.json({success:false, message: "Not enough credits"})
        }
        const {chatId, prompt} = req.body

        const chat = await Chat.findOne({userId, _id:chatId})
        chat.messages.push({role:"user", content: prompt, timestamp: Date.now(), isImage: false})
       
       
        const {choices} = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
       
        {
            role: "user",
            content: prompt,
        },
    ],
});

const reply = {...choices[0].messaage, timestamp: Date.now(), isImage: false}
res.json({success:true, reply})

chat.messages.push(reply)
await chat.save()
await User.updateOne({_id: userId}, {$inc: {credits: -1}})
} catch (error) {
        res.json({success:false, message: error.message} )
}

}
// Image Generation Message Controller
export const imageMessageController = async(req, res) => {
    try {
        const userId = req.user._id
        //Check credits
        if(req.user.credits<2){
            return res.json({success:false, message: "Not enough credits"})
        }

        const{prompt, chatId, isPublished} = req.body
        //find chat
        const chat = await Chat.findOne({userId, _id:chatId})
        //Push user message
        chat.messages.push({
            role:"user", 
            content: prompt,
             timestamp: Date.now(), 
             isImage: false
        });

        //Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)
        //Construct the ImageKit URL
        const generatedImageURL = '${process.env.IMAGE_GENERATION_API_ENDPOINT}/ik-genimg-prompt-/${encodedPrompt}/aigpt/${Date.now()}.png?tr=w-800, h-800';

        //Triger generation by fetching from ImageKit
        const aiImageResponse = await axios.get(generatedImageURL, {responseType: 'arraybuffer'})

        
        //Convert to Base64
        const base64Image = 'data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toStrinh("base64" )}'
        //Upload to Imagekit Media Library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: 'aigpt-${Date.now()}.png',
            folder: 'aigpt',
        })

        
const reply = {role: 'assistant', 
    content: uploadResponse.url,
    timestamp: Date.now(), 
    isImage: true,
    isPublished
}
res.json({success:true, reply})

chat.messages.push(reply)
await chat.save()
await User.updateOne({_id: userId}, {$inc: {credits: -2}})

    } catch (error) {
        res.json({success:false, message: error.message})
    }
}