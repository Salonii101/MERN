import mongoose from "mongoose" ;

export const connectDB = ()=>{
    mongoose.connect(process.env.MONGO_URI , {
        dbname: "SafeNet",
    }).then(()=>{
        console.log(`Database connected successfully`);
    }).catch(err=>{
        console.log("ERROR connecting to Database",err);
    });
};