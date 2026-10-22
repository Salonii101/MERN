// import cron from "node-cron" ;
// import { User } from "../models/userModel.js";
// import { sendEmail } from "../utils/sendEmail.js";


// export const notifyUsers = () => {
// cron.schedule(" */30 * * * *", async () => {
//     //console.log("Schedulong");
//     try{
//         const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
//         const borrowers = await Borrow.find({
//             dueDate: {
//                 $lt: oneDayAgo
//             },
//             returnDate: null,
//             notified: false,
//         });

         
//     }catch(error){
//         console.error("Some error occured while notifying users.",error);
//     }
// });
// };

import cron from "node-cron";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";

export const notifyUsers = () => {
  // Runs every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    try {
      // Fetch all verified users
      const users = await User.find({ accountVerified: true });

      for (const user of users) {
        // Create a logout link
        const logoutUrl = `${process.env.FRONTEND_URL}/logout`;

        // Send reminder email
        await sendEmail({
          to: user.email,
          subject: " Reminder: You are still logged in",
          text: `Hello ${user.name},\n\nYou are still logged in to Thriv Management System.\n\nIf you want, you can click the link below to log out securely:\n\n${logoutUrl}\n\nThank you!`,
        });
      }

      if (users.length > 0) {
        console.log(`✅ Reminder emails sent to ${users.length} logged-in user(s).`);
      }

    } catch (error) {
      console.error("❌ Error while sending login reminder emails:", error);
    }
  });
};
