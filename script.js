const input = document.getElementById("prompt");
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

let extraQuestions = {};


// =====================================
// GEMINI API
// =====================================

const GEMINI_API_KEY =
    AQ.Ab8RN6LCYKd2Hj14pP8tVAFJezyv0XlHz7It66iB7E_T3TVISw
// =====================================
// LOAD QUESTIONS.JSON
// =====================================

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


// =====================================
// BASIC QUESTIONS
// =====================================

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
        "Goodbye! Have a nice day."

};


// =====================================
// ADD MESSAGE
// =====================================

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


// =====================================
// SAVE HISTORY
// =====================================

function saveHistory() {

    localStorage.setItem(
        "flixHistory",
        chatBox.innerHTML
    );

}


// =====================================
// LOAD HISTORY
// =====================================

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


// =====================================
// CALCULATOR
// =====================================

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


// =====================================
// ASK GEMINI
// =====================================

async function askGemini(question) {

    if (
        !GEMINI_API_KEY ||
        GEMINI_API_KEY ===
        "YOUR_GEMINI_API_KEY_HERE"
    ) {

        throw new Error(
            "Gemini API key is missing."
        );

    }


    const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        encodeURIComponent(GEMINI_API_KEY);


    const response =
        await fetch(
            url,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    contents: [

                        {

                            parts: [

                                {

                                    text:
                                        "You are Flix AI, a helpful AI assistant. Answer the user's question clearly and naturally. If the user asks in Hindi or Hinglish, answer in Hindi/Hinglish. If the user asks in English, answer in English.\n\nUser: " +
                                        question

                                }

                            ]

                        }

                    ],

                    generationConfig: {

                        temperature: 0.7,

                        maxOutputTokens: 2048

                    }

                })

            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            "Gemini API error:",
            errorText
        );

        throw new Error(
            "Gemini API request failed."
        );

    }


    const data =
        await response.json();


    const answer =
        data
            ?.candidates?.[0]
            ?.content?.parts?.[0]
            ?.text;


    if (!answer) {

        console.error(
            "Unexpected Gemini response:",
            data
        );

        throw new Error(
            "No Gemini response received."
        );

    }


    return answer.trim();

}


// =====================================
// GET ANSWER
// =====================================

async function getAnswer(text) {

    const cleanText =
        text.toLowerCase().trim();


    // BASIC QUESTIONS

    if (questions[cleanText]) {

        return questions[cleanText];

    }


    // QUESTIONS.JSON

    if (extraQuestions[cleanText]) {

        return extraQuestions[cleanText];

    }


    // CALCULATOR

    const calculation =
        calculate(cleanText);

    if (calculation !== null) {

        return calculation;

    }


    // GEMINI

    try {

        return await askGemini(text);

    }

    catch (error) {

        console.error(
            "Gemini error:",
            error
        );

        return (
            "Sorry, I could not connect to Flix AI right now. Please check your Gemini API key and try again."
        );

    }

}


// =====================================
// SEND MESSAGE
// =====================================

async function reply() {

    const originalText =
        input.value.trim();


    if (!originalText) {

        return;

    }


    // USER MESSAGE

    addMessage(
        originalText,
        "user"
    );


    // CLEAR INPUT

    input.value = "";


    // THINKING

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


// =====================================
// SEND BUTTON
// =====================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        reply
    );

}


// =====================================
// ENTER KEY
// =====================================

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


// =====================================
// VOICE TYPING
// =====================================

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

                recognition.start();

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


// =====================================
// NEW CHAT
// =====================================

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
