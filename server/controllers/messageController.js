import Chat from "../models/Chat.js";
import User from "../models/User.js";
import axios from "axios";
import imagekit from "../configs/imagekit.js";
import openai from "../configs/openai.js";

// 🧠 TEXT MESSAGE CONTROLLER
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check user credits
    if (req.user.credits < 2) {
      return res.json({ success: false, message: "Not enough credits" });
    }

    const { chatId, prompt } = req.body;

    // Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.json({ success: false, message: "Chat not found" });

    // Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    
    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
    });

    
    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    // Respond to client
    res.json({ success: true, reply });

    // Save chat and update credits
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check credits
    if (req.user.credits < 2) {
      return res.json({ success: false, message: "Not enough credits" });
    }

    const { prompt, chatId, isPublished } = req.body;

    // Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.json({ success: false, message: "Chat not found" });

    // Push user prompt
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });


    const encodedPrompt = encodeURIComponent(prompt);
    const generatedImageURL = `${process.env.IMAGE_GENERATION_API_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/aigpt/${Date.now()}.png?tr=w-800,h-800`;

    // Fetch generated image
    const aiImageResponse = await axios.get(generatedImageURL, {
      responseType: "arraybuffer",
    });

    
    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      "binary"
    ).toString("base64")}`;

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `aigpt-${Date.now()}.png`,
      folder: "aigpt",
    });

    // Reply object
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    // Respond to client
    res.json({ success: true, reply });

    // Save to chat and reduce credits
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
