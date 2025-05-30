
import {RowChart} from "./rowChart.js"; 

export class Survey {
    constructor() {
        this.init(); 
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
            
            this.responses = await response.json();
            this.responses.forEach(d => {
                d.count = 1;
            })    
            this.writeReponses(this.responses)
            
            this.facts = crossfilter(this.responses);
            
            new RowChart(this.facts, "state", 200, this.showSelected);
            new RowChart(this.facts, "gender", 200, this.showSelected);
            new RowChart(this.facts, "education_level", 200, this.showSelected);
            new RowChart(this.facts, "sentiment_label", 200, this.showSelected);
           
            new RowChart(this.facts, "income", 200, this.showSelected); 
            new RowChart(this.facts, "age", 200, this.showSelected);
            new RowChart(this.facts, "city", 200, this.showSelected);

            dc.renderAll();
            
        } catch (error) {
            console.error(`Failed to fetch responses for ${question}:`, error);
            return [];
        }
    }

    showSelected() {
        alert("Show Selected");
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
