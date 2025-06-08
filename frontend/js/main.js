import {Map} from './map.js'; 
import {RowChart} from "./rowChart.js"; 
import {ScatterPlot} from "./scatterPlot.js"; 


export class Survey {
    constructor() {
        this.init(); 
    }

    async init() {
        const questions = await this.getQuestions();
        this.createQuestionButtons(questions);
        this.createOutputButtons(['Charts', "Responses"]);

        document.getElementById("clear-filters").addEventListener("click", () => {
            dc.filterAll();
            dc.redrawAll();
            this.showSelected()
        });

        this.question = questions[0];
        this.switchQuestion(this.question);
    }

    // Get a list of questions (strings) from the server 
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

    // On start up or when a question button is clicked, get the responses for the question and display them
    async switchQuestion(question) {

        const addRowCharts = () => {
            const config = {
                facts: dc.facts,
                width: 200,
                updateFunction: this.showSelected
            };
            const chartFields = ["gender", "education_level", "sentiment_label", "income", "age", "city"];
            chartFields.forEach(field => {
                new RowChart(field, config);
            });
        }

        const addScatterPlots = () => {
            const config = {
                facts: dc.facts,
                width: 400,
                height: 300,
                updateFunction: this.showSelected
            };
            const chartFields = ["age"];
            chartFields.forEach(field => {
                new ScatterPlot(field, this.question, field, config);
            });
        }

        this.question = question;
        try {
            const response = await fetch(`/questions/${encodeURIComponent(question)}`);
            if (!response.ok) 
                throw new Error(`Server error: ${response.status}`);
            
            this.responses = await response.json();
            this.responses.forEach(d => {
                d.count = 1;
            })            
            dc.facts = crossfilter(this.responses);
            
            addRowCharts();
            addScatterPlots();
            dc.map = new Map(d3.select('#map'), this.responses, dc.facts.dimension(dc.pluck('state')), this.showSelected);

            dc.renderAll();
            dc.filterAll();
            this.showSelected();           
        } catch (error) {
            console.error(`Failed to fetch responses for ${question}:`, error);
            return [];
        }
    }

    // Show current question, filters, and # of responses. Also list the filtred responses
    showSelected = () => {
        if (!this.responses || !dc.facts) return;
        
        let filters = [];        
        dc.chartRegistry.list().forEach(chart => {
            chart.filters().forEach(filter => filters.push(filter));
        });

        // Hide clear filters button if no filters
        const clearButton = document.getElementById("clear-filters");
        clearButton.style.display = filters.length > 0 ? "block" : "none";

        const responses = dc.facts.allFiltered().length;
        d3.select("#filters")
            .html(`
                <span>Question: ${this.question}</span> &nbsp;
                <span>${responses} responses</span> &nbsp;
                <span>${filters.join(', ')}</span>
            `);

        dc.map.update();    
        dc.redrawAll();
        this.writeResponses(dc.facts.allFiltered());
    }

    // Write a simple table of the filtered responses    
    writeResponses(responses) {            
        const headers = Object.keys(responses[0])
            .filter(key => key !== 'count')
            .sort((a, b) => a === this.question ? 1 : b === this.question ? -1 : 0);

        let html = `<table class="data-table"><thead><tr>`;
        html += headers.map(key => `<th>${key}</th>`).join("");
        html += `</tr></thead><tbody>`;
        html += responses.map(row => {
            return `<tr>` + headers.map(key => `<td>${row[key]}</td>`).join("") + `</tr>`;
        }).join("");

        html += `</tbody></table>`;
        document.getElementById("responses").innerHTML = html
    }

    // Make a button for each question, with a click handler to switch the question
    createQuestionButtons(questionNames) {
        const container = document.getElementById("buttons");
        container.innerHTML = "";
        const highlightButton = (selectedName) => {
            d3.selectAll('.question-button')
                .classed('active', function() {
                    return d3.select(this).text() === selectedName;
                });
        };

        questionNames.forEach(name => {
            const button = document.createElement("button");
            button.textContent = name;
            button.className = "question-button";
            button.addEventListener("click", () => {
                this.switchQuestion(name);
                highlightButton(name);
            });
            container.appendChild(button);
        });

        // Highlight first button on startup
        highlightButton(questionNames[0]);
    }


    // Make a button for each output tab, with a click handler to switch the div
    createOutputButtons(outputNames) {
        const container = document.getElementById("output-buttons");
        container.innerHTML = "";

        const highlightButton = (selectedName) => {
            d3.selectAll('.question-button')
                .classed('active', function() {
                    return d3.select(this).text() === selectedName;
                });
        };

        outputNames.forEach(name => {
            const button = document.createElement("button");
            button.textContent = name;
            button.className = "tab-button";
            button.addEventListener("click", () => {
                this.switchOutput(name);
                highlightButton(name);
            });
            container.appendChild(button);
        });

        // Select first tab on startup
        highlightButton(outputNames[0]);
        this.switchOutput(outputNames[0]);
    }

    switchOutput(output) {
        // Hide all tab content
        document.querySelectorAll('#tab-content > div').forEach(content => {
            content.classList.add('hidden');
        });
    
        // Show the selected tab content
        const targetContent = document.getElementById(output.toLowerCase());
        if (targetContent) 
            targetContent.classList.remove('hidden');
    }
}
