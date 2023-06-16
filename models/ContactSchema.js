const mongoose = require("mongoose");
const Schema = mongoose.Schema;




// define the Schema (the structure of the article)
const contactSchema = new mongoose.Schema(  {

    title: String,
    summary: String,
    number:Number,
    shoesname:String,
    body: String,

  });


  // Create a model based on that schema
const Contact = mongoose.model("Contact us", contactSchema);
  



// export the model
module.exports = Contact;