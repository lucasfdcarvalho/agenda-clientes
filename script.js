const form = document.getElementById("contact-form");
const contactList = document.getElementById("contact-list");
const exportBtn = document.getElementById("export-btn");
const searchInput = document.getElementById("search");
const editIndexInput = document.getElementById("edit-index");
const saveBtn = document.getElementById("save-btn");
const phoneInput = document.getElementById("phone");

// Recuperar contatos do LocalStorage ou inicializar um array vazio
let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

// Salvar os contatos no localStorage
function saveContacts() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

// Renderizar a lista de contatos na tabela
function renderContacts(filter = "") {
    contactList.textContent = "";

    const normalizedFilter = filter.trim().toLowerCase();
    const hasFilter = normalizedFilter.length > 0;
    const fragment = document.createDocumentFragment();

    contacts.forEach((contact, index) => {
        const matchesFilter =
            !hasFilter ||
            contact.name.toLowerCase().includes(normalizedFilter) ||
            contact.phone.includes(normalizedFilter) ||
            contact.email.toLowerCase().includes(normalizedFilter);

        if (!matchesFilter) return;

        const row = document.createElement("tr");
        row.dataset.index = String(index);

        const name = document.createElement("td");
        const phone = document.createElement("td");
        const email = document.createElement("td");
        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.className = "action-buttons edit-btn";
        editButton.dataset.action = "edit";
        editButton.textContent = "Editar";

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-buttons delete-btn";
        deleteButton.dataset.action = "delete";
        deleteButton.textContent = "Deletar";

        name.textContent = contact.name;
        phone.textContent = contact.phone;
        email.textContent = contact.email;

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        row.appendChild(name);
        row.appendChild(phone);
        row.appendChild(email);
        row.appendChild(actions);

        fragment.appendChild(row);
    });

    contactList.appendChild(fragment);
}

// Aplicar máscara no input do telefone
if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
        const target = e.target;
        let value = target.value.replace(/\D/g, "");

        if (value.length > 0) {
            if (value.length <= 2) {
                value = `(${value}`;
            } else if (value.length <= 7) {
                value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            } else {
                value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
            }
        }

        target.value = value;
    });
}

// Validar número de telefone usando a API do numverify
async function validatePhoneNumber(phone) {
    const apiKey = "46e2034a7497e9f5522bf5fc5a45f70c";
    const formattedPhone = phone.replace(/\D/g, "");

    try {
        const response = await fetch(`https://apilayer.net/api/validate?access_key=${apiKey}&number=55${formattedPhone}`);
        const data = await response.json();

        if (!data.valid) {
            alert("Número de telefone inválido! Verifique e tente novamente");
            return false;
        }

        return true;
    } catch (error) {
        console.error(error);
        alert("Erro ao validar telefone, pois o serviço não está funcionando corretamente");
        return false;
    }
}

// Adicionar contato ou editar um contato existente
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = phoneInput.value;
    const email = document.getElementById("email").value;
    const editIndex = editIndexInput.value;

    const isValidPhone = await validatePhoneNumber(phone);
    if (!isValidPhone) return;

    if (editIndex === "") {
        contacts.push({ name, phone, email });
    } else {
        contacts[Number(editIndex)] = { name, phone, email };
        editIndexInput.value = "";
        saveBtn.textContent = "Adicionar Cliente";
    }

    saveContacts();
    renderContacts(searchInput.value);
    form.reset();
});

function editContact(index) {
    const contact = contacts[index];
    document.getElementById("name").value = contact.name;
    phoneInput.value = contact.phone;
    document.getElementById("email").value = contact.email;
    editIndexInput.value = String(index);
    saveBtn.textContent = "Salvar Edição";
}

function deleteContact(index) {
    contacts.splice(index, 1);
    saveContacts();
    renderContacts(searchInput.value);
}

function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(contacts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contatos");

    XLSX.utils.sheet_add_aoa(worksheet, [["Nome", "Telefone", "Email"]], { origin: "A1" });

    XLSX.writeFile(workbook, "agenda_contatos.xlsx");
}

exportBtn.addEventListener("click", exportToExcel);

// Delegação de eventos para reduzir listeners por linha
contactList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) return;

    const row = actionButton.closest("tr[data-index]");
    if (!row) return;

    const index = Number(row.dataset.index);
    if (Number.isNaN(index)) return;

    if (actionButton.dataset.action === "edit") {
        editContact(index);
        return;
    }

    if (actionButton.dataset.action === "delete") {
        deleteContact(index);
    }
});

// Debounce para reduzir renderizações em buscas rápidas
let searchDebounceTimer;
searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        renderContacts(searchInput.value);
    }, 120);
});

renderContacts();
