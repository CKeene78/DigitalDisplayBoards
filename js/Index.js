

var DisplayList = {
    props: {
        list: Object
    },
    template:  `
        <div>
            <header>
                <a>{{ list.Title }}</a>
            </header>
            <ul>
                <li v-for="point in list.Points">
                    {{ point }}
                </li>
            </ul>
        </div>
    `
}

var Table2Col = {
    props: {
        table: Object
    },
    template: `
        <div>
            <header>{{ table.Title }}</header>
            <p><div class="table-container-2">
                <div v-for="Header in table.Headers" class="col-header">
                    {{ Header }}
                </div>
                <div v-for="Row in table.Rows">{{ Row }}</div>
            </div></p>
        </div>
    `
}

var Table3Col = {
    props: {
        table: Object
    },
    template: `
        <div>
            <header>{{ table.Title }}</header>
            <p><div class="table-container-3">
                <div v-for="Header in table.Headers" class="col-header">
                    {{ Header }}
                </div>
                <div v-for="Row in table.Rows">{{ Row }}</div>
            </div></p>
        </div>
    `
}

var app = new Vue({
    el: '#app',
    components: {
        'display-list': DisplayList,
        'table-2-col': Table2Col,
        'table-3-col': Table3Col
    },
    data: {
        fetching: "",
        jsonCovidCommunique: { Title: 'COVID-19 Communique' },
        jsonIQ: { Title: 'Isolation/Quarantine' },
        jsonContacts: { Title: 'Staff Contacts' },
        jsonPatientsOnCommittees: { Title: 'Patients on Committees' },
        jsonVaxInfo: { Title: 'Vaccination Information' }
    },
    mounted: function() {
        this.Query_All();
    },
    methods: {
        Query_All: async function() {
            this.Query_Changes('tblC19Comm').then(Table => this.jsonCovidCommunique = Table)
            this.Query_Changes('tblIQ').then(Table => this.jsonIQ = Table )
            this.Query_Changes('tblPtContacts').then(Table => this.jsonPatientsOnCommittees = Table)
            this.Query_Changes('tblStaffContacts').then(Table => this.jsonContacts = Table)
            this.Query_Changes('tblVaxInfo').then(Table => this.jsonVaxInfo = Table)
        },        
        Query_Changes: async function(tableName){
            
            this.fetching="Getting Updates...";

            const options = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ TableName: tableName })
            }

            let Table = await fetch(env.process(["LOGIC_APP_WITH_SHAREPOINT_CONNECTOR_URL"])),
                options
            )
            .then(response => response.json())
            .then(table => table)           
            
            this.fetching = "";
            return Table;
        }
    }
})


//SIGNALR REGION
//#region

//SIGNALR: CONNECT TO A HUB
const connection = new signalR.HubConnectionBuilder()
    .withUrl(env.process["WEBSITE_URL/API"])
    .configureLogging(signalR.LogLevel.Information)
    .build();

async function start() {
    try {
        await connection.start();
        console.log("SignalR Connected.");
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
    }
}

//SIGNALR: LISTEN FOR CHANGES
connection.on("ReceiveMessage", (message) => {
    app.Query_All();    //Refresh data
});


connection.onclose(start);

// Start the connection.
start()


//#endregion
//END SIGNALR REGION
