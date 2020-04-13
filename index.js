///////////////////////////////////////////////////////////

var client = new faunadb.Client({ secret: 'FAUNADB_SECRET_HERE' });
var q = faunadb.query;
var faunaData = [];

///////////////////////////////////////////////////////////

function getData(){
    client.query(q.Paginate(q.Match(q.Index('people_index'))))
        .then((response) => {
            const allRefValues = response.data.map((ref) => {
                return q.Get(ref)
            })
            return client.query(allRefValues).then((data) => {
                console.log(data);
                faunaData = data;
                populateUI();
            })
        })
        .catch(err => console.warn(err))
}

function addData() {
    var random = Math.floor(Math.random() * (999 - 100) + 100);
    client.query(q.Create(q.Collection('people'), {
        data: {
            firstName: "John" + random,
            lastName: "Smith" + random
        },})) 
        .then(res => {
            console.log(res);
            faunaData.push(res);
            populateUI();
        })
        .catch(err => console.warn(err))
}

function updateData(refID, freshData) {
    client.query(q.Update(q.Ref(q.Collection('people'), refID), { 
            data: freshData 
        },))
        .then((res) => {
            console.log(res);
            populateUI();
        })
        .catch(err => console.warn(err))
}

function deleteData(refID) {
    client.query(q.Delete(q.Ref(q.Collection('people'), refID)))
        .then(res => {
            console.log(res);
            populateUI();
        })
        .catch(err => console.warn(err.message))
}


///////////////////////////////////////////////////////////

function populateUI() {
    var dataOutput = "";

    for(var i=0; i < faunaData.length; i++) {
        var uniqueID = faunaData[i].ref.value.id;
        var person = faunaData[i].data;
        dataOutput += `<div>${uniqueID} - ${person.firstName} ${person.lastName}</div>`;
    }

    if(faunaData.length === 0) {
        dataOutput = "No records found";
    }

    document.getElementById("data").innerHTML = dataOutput;
}

function updateSecondRecord(){
    if(faunaData.length < 2) {
        alert("Add more records first");
        return false;
    }

    var random = Math.floor(Math.random() * (999 - 100) + 100);
    faunaData[1].data.lastName = "Jonas" + random;    
    updateData(faunaData[1].ref.value.id, faunaData[1].data);
}

function deleteThirdRecord() {
    if(faunaData.length < 2) {
        alert("Add more records first");
        return false;
    }

    var thirdPerson = faunaData[2];
    faunaData.splice(2, 1);    
    deleteData(thirdPerson.ref.value.id);
}

window.addEventListener('load', function() {
    populateUI();
})
