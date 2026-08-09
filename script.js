"use strict";

/* =====================================
   FLIX AI - OFFLINE VERSION
   NO API
===================================== */

const input = document.getElementById("prompt");
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

let extraQuestions = {};


/* =====================================
   LOAD QUESTIONS.JSON
===================================== */

fetch("questions.json")
    .then(response => {

        if (!response.ok) {
            throw new Error("questions.json not found");
        }

        return response.json();

    })
    .then(data => {

        if (!Array.isArray(data)) return;

        data.forEach(item => {

            if (item.question && item.answer) {

                extraQuestions[
                    item.question.toLowerCase().trim()
                ] = item.answer;

            }

        });

        console.log("Questions loaded.");

    })
    .catch(error => {

        console.log(
            "questions.json could not be loaded:",
            error
        );

    });


/* =====================================
   BASIC QUESTIONS
===================================== */

const questions = {

    "hello":
        "Hello! How can I help you?",

    "hi":
        "Hi! Welcome to Flix AI.",

    "hey":
        "Hey! Welcome to Flix AI.",

    "who are you":
        "I am Flix AI, your smart AI assistant.",

    "what is ai":
        "AI stands for Artificial Intelligence.",

    "what is earth":
        "Earth is the third planet from the Sun.",

    "what is universe":
        "The universe contains galaxies, stars, planets and everything that exists.",

    "what is computer":
        "A computer is an electronic device that processes data.",

    "what is coding":
        "Coding means writing instructions that computers can understand.",

    "thank you":
        "You're welcome!",

    "thanks":
        "You're welcome!",

    "bye":
        "Goodbye! Have a nice day.",

    "good morning":
        "Good morning! How can I help you?",

    "good afternoon":
        "Good afternoon! What would you like to know?",

    "good evening":
        "Good evening! How can I help you?",

    "what is your name":
        "My name is Flix AI.",

    "are you ai":
        "Yes. I am Flix AI, a browser-based AI assistant.",

    "how are you":
        "I'm doing great! Thanks for asking.",

    "what can you do":
        "I can answer questions stored in my local knowledge base, solve basic calculations, and respond to common questions.",

    "who made you":
        "I was created as Flix AI.",

    "what is flix ai":
        "Flix AI is a browser-based AI assistant project.",

    "what is internet":
        "The Internet is a worldwide network that connects computers and devices.",

    "what is javascript":
        "JavaScript is a programming language commonly used to make websites interactive.",

    "what is html":
        "HTML is the standard markup language used to structure web pages.",

    "what is css":
        "CSS is used to style and design web pages.",

    "what is website":
        "A website is a collection of web pages that can be accessed through a web browser."

};


/* =====================================
   ADD MESSAGE
===================================== */

function addMessage(text, sender) {

    const div =
        document.createElement("div");

    div.className =
        "bubble " + sender;

    div.innerText =
        text;

    chatBox.appendChild(div);

    chatBox.scrollTop =
        chatBox.scrollHeight;

    saveHistory();

}


/* =====================================
   SAVE HISTORY
===================================== */

function saveHistory() {

    localStorage.setItem(
        "flixHistory",
        chatBox.innerHTML
    );

}


/* =====================================
   LOAD HISTORY
===================================== */

window.addEventListener(
    "load",
    function() {

        const oldChat =
            localStorage.getItem(
                "flixHistory"
            );

        if (oldChat) {

            chatBox.innerHTML =
                oldChat;

        }

    }
);


/* =====================================
   CALCULATOR
===================================== */

function calculate(text) {

    if (
        !/^[0-9+\-*/().\s]+$/.test(text)
    ) {

        return null;

    }

    try {

        const result =
            Function(
                '"use strict"; return (' +
                text +
                ')'
            )();

        if (
            typeof result === "number" &&
            isFinite(result)
        ) {

            return String(result);

        }

    }

    catch (error) {

        return null;

    }

    return null;

}


/* =====================================
   GET ANSWER
===================================== */

async function getAnswer(text) {

    const cleanText =
        text.toLowerCase().trim();


    /* BASIC QUESTIONS */

    if (questions[cleanText]) {

        return questions[cleanText];

    }


    /* QUESTIONS.JSON */

    if (extraQuestions[cleanText]) {

        return extraQuestions[cleanText];

    }


    /* CALCULATOR */

    const calculation =
        calculate(cleanText);

    if (calculation !== null) {

        return calculation;

    }


    /* UNKNOWN QUESTION */

    return (
        "Sorry, I don't know the answer to that yet. " +
        "You can add this question and answer to questions.json."
    );

}


/* =====================================
   SEND MESSAGE
===================================== */

async function reply() {

    const originalText =
        input.value.trim();


    if (!originalText) {

        return;

    }


    /* USER MESSAGE */

    addMessage(
        originalText,
        "user"
    );


    /* CLEAR INPUT */

    input.value = "";


    /* THINKING */

    const thinking =
        document.createElement("div");

    thinking.className =
        "bubble ai";

    thinking.innerText =
        "Thinking...";

    chatBox.appendChild(
        thinking
    );

    chatBox.scrollTop =
        chatBox.scrollHeight;


    try {

        const answer =
            await getAnswer(
                originalText
            );


        thinking.remove();


        addMessage(
            answer,
            "ai"
        );

    }

    catch (error) {

        console.error(error);

        thinking.remove();


        addMessage(
            "Sorry, something went wrong.",
            "ai"
        );

    }

}


/* =====================================
   SEND BUTTON
===================================== */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        reply
    );

}


/* =====================================
   ENTER KEY
===================================== */

if (input) {

    input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                reply();

            }

        }
    );

}


/* =====================================
   VOICE TYPING
===================================== */

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

            const text =
                event.results[0][0]
                    .transcript;

            input.value =
                text;

            reply();

        };


    recognition.onerror =
        function(error) {

            console.log(
                "Voice error:",
                error
            );

        };


    if (voiceBtn) {

        voiceBtn.addEventListener(
            "click",
            function() {

                try {

                    recognition.start();

                }

                catch (error) {

                    console.log(error);

                }

            }
        );

    }

}
else {

    if (voiceBtn) {

        voiceBtn.addEventListener(
            "click",
            function() {

                alert(
                    "Voice typing is not supported in this browser."
                );

            }
        );

    }

}


/* =====================================
   NEW CHAT
===================================== */

function newChat() {

    localStorage.removeItem(
        "flixHistory"
    );


    chatBox.innerHTML =
        "";


    input.value =
        "";


    input.focus();

}


/* =====================================
   OPTIONAL NEW CHAT BUTTON
===================================== */

const newChatBtn =
    document.getElementById("newChatBtn");


if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        newChat
    );

}
