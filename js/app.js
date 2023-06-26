const video = document.getElementById("webcam");
const textBox = document.getElementById("textBox");

let synth = window.speechSynthesis;

function speak(text) {
    if (synth.speaking) {
      console.log('still speaking...');
      return;
    }
    if (text !== '') {
      let utterThis = new SpeechSynthesisUtterance(text);
      synth.speak(utterThis);
    }
  }

const labelNames = {
    labelDopper: "a dopper",
    labelNoDopper: "not a dopper",
};

const trainbtn = document.querySelector("#train");
const savebtn = document.querySelector("#save");
const loadbtn = document.querySelector("#load");
const playbtn = document.querySelector("#play");
const checkbtn = document.querySelector("#check");

// Extract the already learned features from MobileNet
const featureExtractor = ml5.featureExtractor('MobileNet', modelLoaded);

// When the model is loaded
function modelLoaded() {
    console.log('Model Loaded!');
  }

// Create a new classifier using those features and with a video element
const classifier = featureExtractor.classification(video, videoReady, {numLabels: 2});

// Triggers when the video is ready
function videoReady() {
    console.log('The video is ready!');
  }

const labelBtns = ["labelDopper", "labelNoDopper"].map(label => {
const btn = document.querySelector(`#${label}`);
btn.addEventListener("click", () => {
    classifier.addImage(label);
    console.log(`Classified ${label}.`);
});
return btn;
});
  
trainbtn.addEventListener("click", () => {
    classifier.train((lossValue) => {
        console.log('Loss is', lossValue);
        if (lossValue === null) {
          console.log('Training completed.');
          // classify();
        } else {
          console.log('Continuing training...');
        }
      });
});

savebtn.addEventListener("click", () => {
    featureExtractor.save();
    console.log("Model saved!");
});

loadbtn.addEventListener("click", () => {
    load();
});

playbtn.addEventListener("click", () => {
    load();
    const randomIndex = Math.floor(Math.random() * labelBtns.length);
    const randomLabel = labelBtns[randomIndex].id;
    output = `Find me ${labelNames[randomLabel]}`;
    textBox.innerHTML = output;
    console.log(output);

// Store the generated label for comparison
const generatedLabel = randomLabel;

const checkBtnClickHandler = () => {
  classifier.classify(video, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`I think it's...`, result[0].label);
      if (result && result.length > 0) {
        const classifiedLabel = result[0].label;
        if (classifiedLabel === generatedLabel) {
          const speechText = `Correct! This is ${labelNames[classifiedLabel]}!`;
          textBox.innerHTML = speechText;
          speak(speechText);
        } else {
          const speechText = `Incorrect! This is ${labelNames[classifiedLabel]}!`;
          textBox.innerHTML = speechText;
          speak(speechText);
        }
      } else {
        const speechText = "Unable to classify";
        textBox.innerHTML = speechText;
        speak(speechText);
      }
    }
    // Remove the event listener after checking the result
    checkbtn.removeEventListener("click", checkBtnClickHandler);
  });
}

    checkbtn.removeEventListener("click", checkBtnClickHandler); 
    checkbtn.addEventListener("click", checkBtnClickHandler);
});


if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => {
            console.log("Something went wrong!");
        });
}

const load = () => {
    featureExtractor.load('model/model.json', () => {
      console.log("Previously saved model loaded!");
    });
  };

const classify = () => {
    setInterval(() => {
      classifier.classify(video, (err, result) => {
        if (err) console.log(err);
        console.log(result);
        textOutput.innerHTML = result[0].label;
      });
    }, 1000);
  };

textBox.innerText = "Ready when you are!";
