const form = document.getElementById("contact-form");
const contactList = document.getElementById("contact-list");
const exportBtn = document.getElementById("export-btn");
const searchInput = document.getElementById("search");
const editIndexInput = document.getElementById("edit-index");
const saveBtn = document.getElementById("save-btn");
const phoneInput = document.getElementById("phone");


// Recuperar contatos do LocalStorage ou inicializa um array vazio

let contacts = JSON.parse(localStorage.getItem("contacts")) || [];


// Salvar os contatos no localStorage

function saveContacts() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}



// Renderizar a Lista de Contatos na Tabela

function renderContacts(filter = "") {
    contactList.innerHTML = "";

    contacts.forEach((contact, index) => {
        if (contact.name.toLowerCase().includes(filter.toLowerCase()) || contact.phone.includes(filter) || contact.email.toLowerCase().includes(filter.toLowerCase())) {
            const row = document.createElement("tr");

            const name = document.createElement("td");
            const telefone = document.createElement("td");
            const email = document.createElement("td");
            const buttonsActions = document.createElement("td");

            const buttonEdit = document.createElement("button");
            const buttonDelete = document.createElement("button");
            buttonEdit.classList.add("action-buttons");
            buttonEdit.classList.add("edit-btn");
            buttonEdit.onclick = () => editContact(index);
            buttonEdit.textContent = "Editar";
            buttonDelete.classList.add("action-buttons");
            buttonDelete.classList.add("delete-btn");
            buttonDelete.onclick = () => deleteContact(index);
            buttonDelete.textContent = "Deletar";

            name.textContent = contact.name;
            telefone.textContent = contact.phone;
            email.textContent = contact.email;
            
            buttonsActions.appendChild(buttonEdit);
            buttonsActions.appendChild(buttonDelete);

            row.appendChild(name);
            row.appendChild(telefone);
            row.appendChild(email);
            row.appendChild(buttonsActions);

            contactList.appendChild(row);
        }
    });
}

// Aplicar máscara no input do telefone

document.addEventListener("DOMContentLoaded", function(){
    if(phoneInput){
        phoneInput.addEventListener("input", function(e){
            const target = e.target;
            let value = target.value.replace(/\D/g, "");

            if(value.length > 0){
                if(value.length <= 2){
                    value = `(${value}`;
                }else if(value.length <= 7){
                    value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                }else {
                    value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7,11)}`;
                }
            }

            target.value = value;
        })
    }
});



// Validar número de telefone usando a API do numverify

async function validadePhoneNumber(phone) {
    const apiKey = "46e2034a7497e9f5522bf5fc5a45f70c";
    const formattedPhone = phone.replace(/\D/g, "");

    try{
        const response = await fetch(`https://apilayer.net/api/validate?access_key=${apiKey}&number=55${formattedPhone}`);
        const data = await response.json(); 

        if(!data.valid){
            alert("Número de telefone inválido! Verifique e tente novamente");
            return false;
        }

        return true;
    }catch(error){
        console.error(error);
        alert("Erro ao validar telefone, pois o serviço não está funcionando corretamente");
        return false;
    }
}


// Adicionar contato ou editar um contato existente

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = phoneInput.value;
    const email = document.getElementById("email").value;
    const editIndex = editIndexInput.value;

    const isValidPhone = await validadePhoneNumber(phone);

    if(!isValidPhone) return;

    if(editIndex === ""){
        contacts.push({name, phone, email});
    }else {
        contacts[editIndex] = {name, phone, email};
        editIndex.value = "";
        saveBtn.textContent = "Adicionar Cliente";
    }

    saveContacts();
    renderContacts();
    form.reset();
});

function editContact(index){
    const contact = contacts[index];
    document.getElementById("name").value = contact.name;
    document.getElementById("phone").value = contact.phone;
    document.getElementById("email").value = contact.email;
    editIndexInput.value = index;
    saveBtn.textContent = "Salvar Edição";
}

function deleteContact(index){
    contacts.splice(index, 1);
    saveContacts();
    searchInput.value = "";
    renderContacts();
}

function exportToExcel(){
    const worksheet = XLSX.utils.json_to_sheet(contacts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contatos");

    XLSX.utils.sheet_add_aoa(worksheet, [["Nome", "Telefone", "Email"]], { origin: "A1" });

    XLSX.writeFile(workbook, "agenda_contatos.xlsx");
}


exportBtn.addEventListener("click", exportToExcel);



// Filtrar valores no input de busca

searchInput.addEventListener("input", function(){
    renderContacts(searchInput.value);
});

renderContacts();