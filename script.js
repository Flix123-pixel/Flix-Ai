const input = document.getElementById("prompt");
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");


// ===============================
// EXTRA QUESTIONS
// ===============================

let extraQuestions = {};


// ===============================
// LOAD QUESTIONS.JSON
// ===============================

fetch("questions.json")
    .then(function(response) {

        if (!response.ok) {
            throw new Error("questions.json not found");
        }

        return response.json();

    })
    .then(function(data) {

        data.forEach(function(item) {

            extraQuestions[
                item.question.toLowerCase().trim()
            ] = item.answer;

        });

        console.log("Questions loaded successfully.");

    })
    .catch(function(error) {

        console.log(
            "questions.json could not be loaded:",
            error
        );

    });


// ===============================
// BASIC AI QUESTIONS
// ===============================

const questions = {

    "hello":
        "Hello! How can I help you?",

    "hi":
        "Hi! Welcome to Flix AI.",

    "hey":
        "Hey! Welcome to Flix AI.",

    "who are you":
        "I am Flix AI, your smart assistant.",

    "what is ai":
        "AI stands for Artificial Intelligence.",

    "what is earth":
        "Earth is the third planet from the Sun.",

    "what is universe":
        "The universe contains galaxies, stars, planets, and everything that exists.",

    "what is computer":
        "A computer is an electronic device that processes data.",

    "what is coding":
        "Coding means writing instructions for computers.",

    "thank you":
        "You're welcome!",

    "thanks":
        "You're welcome!",

    "bye":
        "Goodbye! Have a nice day."

};


// ===============================
// ADD MESSAGE
// ===============================

function addMessage(text, sender) {

    const div = document.createElement("div");

    div.className = "bubble " + sender;

    div.innerText = text;

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

    saveHistory();

}


// ===============================
// SAVE CHAT HISTORY
// ===============================

function saveHistory() {

    localStorage.setItem(
        "flixHistory",
        chatBox.innerHTML
    );

}


// ===============================
// LOAD CHAT HISTORY
// ===============================

window.addEventListener("load", function() {

    const oldChat =
        localStorage.getItem("flixHistory");

    if (oldChat) {

        chatBox.innerHTML = oldChat;

    }

});


// ===============================
// GET AI ANSWER
// ===============================

function getAnswer(text) {

    let answer = "";


    // Basic questions

    if (questions[text]) {

        answer = questions[text];

    }


    // questions.json

    else if (extraQuestions[text]) {

        answer = extraQuestions[text];

    }


    // Calculator

    else if (/^[0-9+\-*/().\s]+$/.test(text)) {

        try {

            answer = Function(
                '"use strict"; return (' + text + ')'
            )().toString();

        }

        catch (error) {

            answer = "Invalid calculation.";

        }

    }


    // Unknown question

    else {

        answer =
            "Sorry, I don't know this yet. I am still learning.";

    }


    return answer;

}


// ===============================
// SEND MESSAGE
// ===============================

function reply() {

    const originalText =
        input.value.trim();

    const text =
        originalText.toLowerCase();


    // Empty message

    if (text === "") {

        return;

    }


    // Add user message

    addMessage(
        originalText,
        "user"
    );


    // Clear input

    input.value = "";


    // Thinking message

    const thinking =
        document.createElement("div");

    thinking.className =
        "bubble ai";

    thinking.innerText =
        "Thinking...";

    chatBox.appendChild(thinking);

    chatBox.scrollTop =
        chatBox.scrollHeight;


    // Get answer

    setTimeout(function() {

        const answer =
            getAnswer(text);

        thinking.remove();

        addMessage(
            answer,
            "ai"
        );

    }, 500);

}


// ===============================
// SEND BUTTON
// ===============================

sendBtn.addEventListener(
    "click",
    reply
);


// ===============================
// ENTER BUTTON
// ===============================

input.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            reply();

        }

    }
);


// ===============================
// VOICE TYPING
// ===============================

if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onresult =
        function(event) {

            input.value =
                event.results[0][0].transcript;

            reply();

        };


    recognition.onerror =
        function() {

            console.log(
                "Voice recognition error."
            );

        };


    voiceBtn.onclick =
        function() {

            recognition.start();

        };

}
else {

    voiceBtn.onclick =
        function() {

            alert(
                "Voice typing is not supported in this browser."
            );

        };

}


// ===============================
// NEW CHAT
// ===============================

function newChat() {

    // Delete saved chat history

    localStorage.removeItem(
        "flixHistory"
    );


    // Clear all messages

    chatBox.innerHTML = "";


    // Clear input box

    input.value = "";


    // Focus input box

    input.focus();

}
