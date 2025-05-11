const mysql = require("mysql2");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("=== MySQL Setup for School Management API ===");
console.log(
  "This script will help set up your MySQL database for production use.\n"
);

// Prompt for MySQL root credentials
rl.question("Enter MySQL root username (default: root): ", (rootUser) => {
  rootUser = rootUser || "root";

  rl.question("Enter MySQL root password: ", (rootPassword) => {
    // Connect to MySQL with root privileges
    console.log("\nConnecting to MySQL server...");

    const rootConnection = mysql.createConnection({
      host: "localhost",
      user: rootUser,
      password: rootPassword,
    });

    rootConnection.connect((err) => {
      if (err) {
        console.error("Error connecting to MySQL:", err);
        console.log("\nPlease check your MySQL installation and credentials.");
        rl.close();
        return;
      }

      console.log("Successfully connected to MySQL server!");

      // Create database
      const dbName = "school_management";
      console.log(`\nCreating database '${dbName}'...`);

      rootConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
        if (err) {
          console.error("Error creating database:", err);
          rootConnection.end();
          rl.close();
          return;
        }

        console.log(`Database '${dbName}' created or already exists.`);

        // Prompt for app user credentials
        rl.question(
          "\nEnter username for application (default: school_app): ",
          (appUser) => {
            appUser = appUser || "school_app";

            rl.question(
              "Enter password for application user: ",
              (appPassword) => {
                if (!appPassword) {
                  console.log("Password cannot be empty!");
                  rootConnection.end();
                  rl.close();
                  return;
                }

                // Create app user
                console.log(`\nCreating user '${appUser}'...`);

                rootConnection.query(
                  `CREATE USER IF NOT EXISTS '${appUser}'@'localhost' IDENTIFIED BY '${appPassword}'`,
                  (err) => {
                    if (err) {
                      console.error("Error creating user:", err);
                      rootConnection.end();
                      rl.close();
                      return;
                    }

                    console.log(`User '${appUser}' created or already exists.`);

                    // Grant privileges
                    console.log(
                      `\nGranting privileges to '${appUser}' on database '${dbName}'...`
                    );

                    rootConnection.query(
                      `GRANT ALL PRIVILEGES ON ${dbName}.* TO '${appUser}'@'localhost'`,
                      (err) => {
                        if (err) {
                          console.error("Error granting privileges:", err);
                          rootConnection.end();
                          rl.close();
                          return;
                        }

                        // Apply changes
                        rootConnection.query("FLUSH PRIVILEGES", (err) => {
                          if (err) {
                            console.error("Error flushing privileges:", err);
                          } else {
                            console.log("Privileges granted and applied.");

                            // Create schools table
                            console.log(
                              `\nCreating 'schools' table in '${dbName}'...`
                            );

                            rootConnection.query(`USE ${dbName}`, (err) => {
                              if (err) {
                                console.error("Error selecting database:", err);
                                rootConnection.end();
                                rl.close();
                                return;
                              }

                              const createTableQuery = `
                        CREATE TABLE IF NOT EXISTS schools (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,
                          address VARCHAR(255) NOT NULL,
                          latitude FLOAT NOT NULL,
                          longitude FLOAT NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                      `;

                              rootConnection.query(createTableQuery, (err) => {
                                if (err) {
                                  console.error("Error creating table:", err);
                                } else {
                                  console.log(
                                    "Schools table created successfully."
                                  );

                                  // Update config.env file
                                  console.log(
                                    "\nUpdate your config.env file with these settings:"
                                  );
                                  console.log(
                                    "------------------------------------------"
                                  );
                                  console.log(`DB_HOST=localhost`);
                                  console.log(`DB_USER=${appUser}`);
                                  console.log(`DB_PASSWORD=${appPassword}`);
                                  console.log(`DB_NAME=${dbName}`);
                                  console.log("PORT=3000");
                                  console.log(
                                    "------------------------------------------"
                                  );
                                }

                                // Close connections
                                rootConnection.end();
                                rl.close();
                              });
                            });
                          }
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  });
});
