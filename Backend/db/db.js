import mongoose from "mongoose";


function connect() {
  mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

  })
  .catch(() =>{
 console.log(err)
  })
}

export default connect;