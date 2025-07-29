document.addEventListener("DOMContentLoaded", () => {

  localStorage.setItem("themeState", false);

  const switchInput = document.getElementById("switch-input");
  const question = document.getElementById("question");
  const quizContent = document.getElementById("quiz-content");


  switchInput.addEventListener("change", () => {
    localStorage.setItem("themeState", switchInput.checked);
    toggleTheme();
  });


  function toggleTheme() {

    console.log(localStorage.getItem("themeState") );

    if (localStorage.getItem("themeState") === "true") {
      document.body.classList.add("dark");
      document.querySelector(".logo").classList.add("dark");
      document.querySelector(".group-theme").classList.add("dark");
      const cardCompleted = document.querySelector(".message-scored");
      if (cardCompleted) {
        cardCompleted.classList.add("dark");
      } else {
        document.querySelector(".subtitle").classList.add("dark");
      }
      document.querySelectorAll(".quiz-item").forEach((li) => {
        li.classList.add("dark");
      });
    } else {
      document.body.classList.remove("dark");
      document.querySelector(".logo").classList.remove("dark");
      document.querySelector(".group-theme").classList.remove("dark");
      const cardCompleted = document.querySelector(".message-scored");
      if (cardCompleted) {
        cardCompleted.classList.remove("dark");
      } else {
        document.querySelector(".subtitle").classList.remove("dark");
      }
      document.querySelectorAll(".quiz-item").forEach((li) => {
        li.classList.remove("dark");
      });
    }
  }

  getDataInitial();

  let quizzesColor = null;
  async function getDataInitial() {
    
    await fetch("data.json")
      .then((response) => response.json())
      .then((data) => {
        let html = "";
        data.quizzes.forEach((valor) => {
          html += `<li class="quiz-item">
                <div class="icon-svg">
                  <img src="${valor.icon}" alt="" width="24px" height="24px">
                </div>
                ${valor.title}
              </li>`;
        });

        const card = document.createElement("div");
        card.id = "cardQuizContent";
        card.classList.add("cadQuizContent");
        card.innerHTML += `
            <div class="title">
              <h1>Welcome to the <br><strong>Frontend Quiz!</strong></h1>
              <span class="subtitle">Pick a subject to get started.</span>
            </div>
            <ul class="quiz-items">
              ${html}
            </ul>
          `;

        quizContent.appendChild(card);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });

    document.querySelector(".quiz-items").addEventListener("click", (e) => {
      if (e.target && e.target.matches(".quiz-item")) {
        // const items = document.querySelectorAll(".item");
        const textContent = e.target.textContent;

        const etiqueta = e.target.querySelector(".icon-svg");
        const estilo = getComputedStyle(etiqueta);
        quizzesColor = estilo.backgroundColor;

        // console.log(quizzesColor);

        getDataQuestion(textContent.trim());
        // const quizContent = document.getElementById("quiz-content");
        // quizContent.classList.add("none");
        const cardQuizContent = document.getElementById("cardQuizContent");
        if (cardQuizContent) {
          cardQuizContent.remove();
        }
      }
    });
    toggleTheme();
  }
  let countQuestions = 0;
  let totalQuestions = 0;
  let correctQuestion = 0;
  let filteredData = null;

  async function getDataQuestion(textContent = "") {
    // toggleTheme() 
    try {
      const response = await fetch("data.json");
      const data = await response.json();

      filteredData = data.quizzes.filter((f) => f.title === textContent);

      totalQuestions = filteredData[0].questions.length;
      createCardQuestion(filteredData);
      // console.log(filteredData);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }

    // console.log(filteredData[0].title);
    const quizzesBarraTheme = document.getElementById("quizzes-barra-theme");
    const card = document.createElement("div");
    card.id = "quizzes-barra";
    card.classList.add("quizzes-barra");
    card.innerHTML = `
      <div class="quizzes-barra-icon" style="background-color: ${quizzesColor}">
        <img src="${filteredData[0].icon}" alt="" width="24px" height="24px">
      </div>
      <strong class="quizzes-barra-text">${filteredData[0].title}</strong>`;
    quizzesBarraTheme.appendChild(card);
  }

  let seleccionadoStyle = null;
  let seleccionadoContent = null;
  let answer = null;

  function createCardQuestion(filteredData) {
    // console.log(countQuestions);
    // console.log(filteredData[0].questions[countQuestions]);
    let html = "";
    filteredData[0].questions[countQuestions].options.forEach((valor) => {
      const texto = valor.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      html += `<li tabindex="0" class="quiz-item">
                  <div class="group-icon-svg">
                    <div class="icon-svg">A</div><span class="quiz-item-text">${texto}</span>
                  </div>
              </li>`;
    });
    answer = filteredData[0].questions[countQuestions].answer;
    const card = document.createElement("div");
    card.id = "cardQuestion";
    card.classList.add("cardQuestion");
    card.innerHTML = `
              <div class="group-title">
                <div class="title">
                  <div class="subtitle">Question ${
                    countQuestions + 1
                  } of ${totalQuestions}</div>
                  <h1>${filteredData[0].questions[countQuestions].question}</h1>	
                </div>
                <div class="progreso-quiz">
                  <div class="progresoQuestion" id="progresoQuestion"></div>
                </div>
              </div>
              <div class="quiz">
                <ul class="quiz-items">
                  ${html}
                </ul>
                <button class="btn-answer">Submit Answer</button>
              </div>
            `;
    question.appendChild(card);

    // document.querySelector(".quiz-item-text").textContent = "A";

    // Para saber cuál elemento se ha seleccionado
    const quisItemAll = document.querySelectorAll(".quiz-item");
    quisItemAll.forEach((item) => {
      item.addEventListener("focus", (e) => {
        seleccionadoStyle = item;
        seleccionadoContent = e;
      });
    });

    const btnAnswer = document.querySelector(".btn-answer");
    btnAnswer.addEventListener("click", () => {
      const removeMessage = document.querySelector(".message-answer");
      if (removeMessage) {
        removeMessage.remove();
      }
      submitAnswer();
    });
    countQuestions++;
    toggleTheme();
  }

  function submitAnswer() {
    if (!seleccionadoStyle) {
      const quiz = document.querySelector(".quiz");
      const message = document.createElement("div");
      message.classList.add("message-answer");
      message.innerHTML = `
                            <img src="./assets/images/icon-error.svg" alt="" width="24px" height="24px">
                            <span>Please select an answer.</span>
                          `;
      quiz.appendChild(message);
      return;
    }
    if (
      answer === seleccionadoContent.target.querySelector("span").textContent
    ) {
      // seleccionadoStyle.style = "border: 3px solid var(--red-500);";
      seleccionadoStyle.style.border = "3px";
      seleccionadoStyle.style.borderStyle = "solid ";
      seleccionadoStyle.style.borderColor = "var(--green-200)";
      const span = seleccionadoStyle.querySelector(".icon-svg");
      span.style.backgroundColor = "var(--green-200)";
      span.style.color = "var(--white)";
      const img = document.createElement("div");
      img.innerHTML = `<img src="./assets/images/icon-correct.svg" alt="" width="24px" height="24px">`;
      seleccionadoStyle.appendChild(img);
      correctQuestion++;
    } else {
      seleccionadoStyle.style.border = "3px";
      seleccionadoStyle.style.borderStyle = "solid ";
      seleccionadoStyle.style.borderColor = "var(--red-500)";
      const span = seleccionadoStyle.querySelector(".icon-svg");
      span.style.backgroundColor = "var(--red-500)";
      span.style.color = "var(--white)";
      const img = document.createElement("div");
      img.innerHTML = `<img src="./assets/images/icon-incorrect.svg" alt="" width="24px" height="24px">`;
      seleccionadoStyle.appendChild(img);

      // Mostrar la respuesta correcta
      const quisItemAllCorrect = document.querySelectorAll(".quiz-item");
      quisItemAllCorrect.forEach((item) => {
        if (answer === item.querySelector("span").textContent) {
          const img = document.createElement("div");
          img.innerHTML = `<img src="./assets/images/icon-correct.svg" alt="" width="24px" height="24px">`;
          item.appendChild(img);
          // console.log(item.querySelector("span").textContent);
        }
      });
    }
    document.querySelector(".btn-answer").remove();
    const quiz = document.querySelector(".quiz");
    const btn = document.createElement("button");
    btn.classList.add("btn-next-question");
    btn.innerHTML = `Next Question
                          `;
    quiz.appendChild(btn);

    const btnNextQuestion = document.querySelector(".btn-next-question");
    btnNextQuestion.addEventListener("click", (e) => {
      const cardQuestion = document.getElementById("cardQuestion");
      if (cardQuestion) {
        cardQuestion.remove();
      }
      seleccionadoContent = null;
      seleccionadoStyle = null;

      if (countQuestions < totalQuestions) {
        createCardQuestion(filteredData);
        progresoBarra();
      } else {
        createCardCompleted();
      }
    });
  }

  function progresoBarra() {
    const progresoQuestion = document.getElementById("progresoQuestion");
    const totalProgreso = ((countQuestions - 1) * 100) / totalQuestions;
    progresoQuestion.style.width = totalProgreso + "%";
  }

  function createCardCompleted() {
    const card = document.createElement("div");
    card.id = "cardCompleted";
    card.classList.add("cardCompleted");
    card.innerHTML = `
              <div class="title">
                <h1>Quiz completed! <strong>you scored...</strong></h1>
              </div>
              <div class="quiz">
                <div class="message-scored">
                  <div class="quizzes-barra">
                    <div class="quizzes-barra-icon" style="background-color: ${quizzesColor}">
                      <img src="${filteredData[0].icon}" alt="" width="24px" height="24px">
                    </div>
                    <strong class="quizzes-barra-text">${filteredData[0].title}</strong>
                  </div>
                  <span class="scored-text">${correctQuestion}</span>
                  <span class="out-text">out of ${totalQuestions}</span>
                </div>
                <button class="btn-Again">Play Again</button>
              </div>
            `;
    question.appendChild(card);
    const btnAnswer = document.querySelector(".btn-Again");
    btnAnswer.addEventListener("click", () => {
      const cardCompleted = document.getElementById("cardCompleted");
      const quizzesBarra = document.getElementById("quizzes-barra");
      if (cardCompleted) {
        cardCompleted.remove();
        quizzesBarra.remove();
      }
      countQuestions = 0;
      correctQuestion = 0;
      getDataInitial();
      
    });
    toggleTheme();
  }
});
