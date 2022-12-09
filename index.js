const dotenv = require("dotenv");
const Instagram = require("instagram-web-api");
const prompt = require("prompt-sync")();
const FileCookieStore = require("tough-cookie-filestore2");
const cookieStore = new FileCookieStore("./cookies.json");
dotenv.config();

const { IG_USER: username, IG_PASSWORD: password } = process.env;

const client = new Instagram({ username, password, cookieStore });

(async () => {
  try {
    await client.login();
    const profile = await client.getProfile();

    console.log(profile);
  } catch (e) {
    console.log({ e });

    const { error } = e;
    const { message, checkpoint_url: checkpointUrl } = error;
    console.log(message);
    const checkpointRequired = message === "checkpoint_required";
    if (checkpointRequired) {
      console.log("checkpoint is required", checkpointUrl);

      const challengeInfo = await client.getChallenge({
        challengeUrl: checkpointUrl,
      });

      const forwardUrl = challengeInfo.navigation.forward;

      console.log({ challengeInfo });

      await client.updateChallenge({ challengeUrl: forwardUrl, choice: 0 });

      const securityCode = prompt(
        "What is the security code that was texted to you?"
      );

      console.log({ securityCode });

      await client.updateChallenge({
        challengeUrl: forwardUrl,
        securityCode: securityCode,
      });
    } else {
      console.error("it's something else");
    }
  }
})();
