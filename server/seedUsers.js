// /*This file is only for testing (creating dummy users and friends )
//  */

// const mongoose = require("mongoose");
// const { faker } = require("@faker-js/faker");
// const User = require("./models/userModel");

// const countries = [
//   { name: "Afghanistan", languages: ["Pashto", "Dari"] },
//   { name: "Albania", languages: ["Albanian"] },
//   { name: "Algeria", languages: ["Arabic", "Berber"] },
//   { name: "Andorra", languages: ["Catalan"] },
//   { name: "Angola", languages: ["Portuguese"] },
//   { name: "Antigua and Barbuda", languages: ["English"] },
//   { name: "Argentina", languages: ["Spanish"] },
//   { name: "Armenia", languages: ["Armenian"] },
//   { name: "Australia", languages: ["English"] },
//   { name: "Austria", languages: ["German"] },
//   { name: "Azerbaijan", languages: ["Azerbaijani"] },
//   { name: "Bahamas", languages: ["English"] },
//   { name: "Bahrain", languages: ["Arabic"] },
//   { name: "Bangladesh", languages: ["Bengali"] },
//   { name: "Barbados", languages: ["English"] },
//   { name: "Belarus", languages: ["Belarusian", "Russian"] },
//   { name: "Belgium", languages: ["Dutch", "French", "German"] },
//   { name: "Belize", languages: ["English"] },
//   { name: "Benin", languages: ["French"] },
//   { name: "Bhutan", languages: ["Dzongkha"] },
//   { name: "Bolivia", languages: ["Spanish", "Quechua", "Aymara"] },
//   {
//     name: "Bosnia and Herzegovina",
//     languages: ["Bosnian", "Croatian", "Serbian"],
//   },
//   { name: "Botswana", languages: ["English", "Setswana"] },
//   { name: "Brazil", languages: ["Portuguese"] },
//   { name: "Brunei", languages: ["Malay"] },
// ];

// const dbUri = "mongodb://127.0.0.1:27017/dialog-room";

// function getRandomElements(arr, count) {
//   const shuffled = faker.helpers.shuffle(arr);
//   return shuffled.slice(0, count);
// }

// async function seedUsers() {
//   await mongoose.connect(dbUri);

//   await User.deleteMany();

//   const users = [];

//   // Create and save users
//   for (let i = 0; i < 100; i++) {
//     const country = faker.helpers.arrayElement(countries);
//     const name = faker.person.firstName();
//     const email = faker.internet.email({ firstName: name }).toLowerCase();

//     const fluentIn = getRandomElements(
//       country.languages,
//       faker.number.int({ min: 1, max: country.languages.length })
//     );

//     const otherLanguages = countries
//       .filter((c) => c.name !== country.name)
//       .flatMap((c) => c.languages);

//     const learningLanguage = getRandomElements(
//       otherLanguages,
//       faker.number.int({ min: 1, max: 2 })
//     );

//     const birthdate = faker.date.between({
//       from: "1980-01-01",
//       to: "2005-12-31",
//     });

//     const user = await User.create({
//       name,
//       email,
//       password: "1234",
//       passwordConfirm: "1234",
//       country: country.name,
//       gender: faker.helpers.arrayElement(["Male", "Female", "Non-Binary"]),
//       birthdate,
//       learningLanguage,
//       fluentIn,
//       agree: true,
//     });

//     users.push(user);
//   }

//   // Bulk update: make all users friends with each other
//   const userIds = users.map((u) => u._id);

//   const bulkOps = users.map((user) => ({
//     updateOne: {
//       filter: { _id: user._id },
//       update: {
//         friends: userIds.filter((id) => !id.equals(user._id)),
//       },
//     },
//   }));

//   await User.bulkWrite(bulkOps);

//   console.log("🌱 Seeding complete.");
//   mongoose.disconnect();
// }

// seedUsers().catch((err) => {
//   console.error("Seeding error:", err);
//   mongoose.disconnect();
// });
