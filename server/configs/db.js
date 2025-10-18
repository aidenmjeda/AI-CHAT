import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () => 
        console.log('MongoDB connected successfully')
        )
        await mongose.connect('${process.env.MONGODB_URI}/AI_GPT');
    }catch(error){
        console.log('MongoDB connection failed: ', error.meessage);
    }
}

export default connectDB;