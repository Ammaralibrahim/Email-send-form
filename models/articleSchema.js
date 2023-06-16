const mongoose = require("mongoose");
const Schema = mongoose.Schema;




// define the Schema (the structure of the article)
const articleSchema = new Schema(  {

    title: String,
    summary: String,
    body: String,

  }                        );


  // Create a model based on that schema
const Posts = mongoose.model("Posts", articleSchema);



// export the model
module.exports = Posts;
