const User = require("../../models/User");
 
const opositorSeeder = async () => {

	const emails = ["opositor1@example.com", "opositor2@example.com", "opositor3@example.com"];

  const existing = await User.find({ email: { $in: emails} });
  if (existing.length > 0) {
    console.log("Opositores already exist: ", existing.map(u => u.email));
    return;
  }
 
  const user1 = new User({
    name: "Opositor 1",
    email: "opositor1@example.com",
    password: "Password_1234",
    role: "opositor",
  });
	const user2 = new User({
    name: "Opositor 2",
    email: "opositor2@example.com",
    password: "Password_1234",
    role: "opositor",
  });
	const user3 = new User({
    name: "Opositor 3",
    email: "opositor3@example.com",
    password: "Password_1234",
    role: "opositor",
  });
 
  await user1.save();
	await user2.save();
	await user3.save();
  console.log("Opositores created");
};
 
module.exports = opositorSeeder;