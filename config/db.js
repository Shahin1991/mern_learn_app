const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async()=>{
    try{
        console.log('MongoDB connecting');
        await mongoose.connect(db,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useCreateIndex:true,
            useFindAndModify:false
        });
        console.log('MongoDB connected..');
    }
    catch(err){
       console.log("error" +err);
       process.exit(1);
    }
}


module.exports=connectDB;