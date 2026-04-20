const User = require("../../models/User");
 
const adminSeeder = async () => {
  const existing = await User.findOne({ email: "admin@example.com" });
  if (existing) {
    console.log("Admin already exists");
    return;
  }
 
  const user = new User({
    name: "Admin",
    email: "admin@example.com",
    password: "expample1234",
    role: "admin",
  });
 
  await user.save();
  console.log("Admin user created");
};
 
module.exports = adminSeeder;