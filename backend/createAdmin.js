
const bcrypt = require("bcryptjs");
const db = require("./database");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  try {
    const name = await ask("\nEnter admin name: ");
    const email = (await ask("Enter admin email: ")).toLowerCase();
    const password = await ask("Enter admin password (8+ characters): ");

    if (!name || !email.includes("@") || password.length < 8) {
      console.log("Invalid details. Please run the script again.");
      return;
    }

    const existing = await new Promise((resolve, reject) => {
      db.get(
        "SELECT id, role FROM users WHERE email = ?",
        [email],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });

    if (existing) {
      console.log(`Email already exists. Current role: ${existing.role}`);
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password, role, phone, location)
         VALUES (?, ?, ?, 'admin', '', '')`,
        [name, email, hash],
        (err) => err ? reject(err) : resolve()
      );
    });

    console.log("\nAdmin account created successfully!");
    console.log("Admin email:", email);
  } catch (err) {
    console.error("\nError:", err.message);
  } finally {
    rl.close();
    db.close();
  }
}

main();
