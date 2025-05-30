export class Survey {
    constructor() {
        this.init();  // async setup
    }

    async init() {
        const questions = await this.getQuestions();
        this.createQuestionButtons(questions);

        this.question = questions[0];
        this.getResponses(this.question);
    }

    async getQuestions() {
        try {
            const response = await fetch("/questions/list");
            if (!response.ok) 
                throw new Error(`Server error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch question list:", error);
            return [];
        }
    }

    async getResponses(question) {
        try {
            const response = await fetch(`/questions/${encodeURIComponent(question)}`);
            if (!response.ok) 
                throw new Error(`Server error: ${response.status}`);
            
            const responses = await response.json();

            this.writeReponses(responses)
            // Do Crosfilter stuff
            
        } catch (error) {
            console.error(`Failed to fetch responses for ${question}:`, error);
            return [];
        }
    }

    writeReponses(responses) {            
        const headers = Object.keys(responses[0]);
        let html = `<table class="data-table"><thead><tr>`;
        html += headers.map(key => `<th>${key}</th>`).join("");
        html += `</tr></thead><tbody>`;
        html += responses.map(row => {
            return `<tr>` + headers.map(key => `<td>${row[key]}</td>`).join("") + `</tr>`;
        }).join("");

        html += `</tbody></table>`;
        document.getElementById("list").innerHTML = html

    }


    createQuestionButtons(questionNames) {
        const container = document.getElementById("buttons");
        container.innerHTML = "";

        questionNames.forEach(name => {
            const button = document.createElement("button");
            button.textContent = name;
            button.className = "question-button";
            button.addEventListener("click", () => this.getResponses(name));
            container.appendChild(button);
        });
    }
}
