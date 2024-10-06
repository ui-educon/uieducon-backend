const liveVideoWebhook = async(req,res)=>{

    console.log("WEB HOOK RECEIVED")
    console.log(req.body)

    res.status(200).send("OK");
}


module.exports = {
    liveVideoWebhook
}