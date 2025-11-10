// ui.js
// Módulo para manipulação da UI e renderização

let currentExpenses = getExpenses();
let currentInvestments = getInvestments();

/**
 * Mostra a seção especificada e esconde as outras.
 * @param {string} sectionId - ID da seção a ser mostrada.
 */
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
    // Atualiza o conteúdo da seção ao mostrá-la
    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'expenses') renderExpenses();
    if (sectionId === 'investments') renderInvestments();
    if (sectionId === 'reports') generateReport(); // Gera relatório inicial
}

/**
 * Atualiza o dashboard com cálculos atuais.
 */
function updateDashboard() {
    const totalExpenses = currentExpenses.reduce((sum, exp) => sum + parseFloat(exp.value), 0);
    const totalInvested = currentInvestments.reduce((sum, inv) => sum + parseFloat(inv.value), 0);
    const totalYield = currentInvestments.reduce((sum, inv) => sum + parseFloat(inv.yield), 0);
    const currentBalance = totalInvested + totalYield - totalExpenses;

    document.getElementById('current-balance').textContent = `R$ ${currentBalance.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `R$ ${totalExpenses.toFixed(2)}`;
    document.getElementById('total-invested').textContent = `R$ ${totalInvested.toFixed(2)}`;
    document.getElementById('total-yield').textContent = `R$ ${totalYield.toFixed(2)}`;
}

/**
 * Renderiza a lista de gastos.
 * @param {Array} [expenses=currentExpenses] - Array de gastos a renderizar.
 */
function renderExpenses(expenses = currentExpenses) {
    const list = document.getElementById('expense-list');
    list.innerHTML = '';
    expenses.forEach(exp => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${exp.description} - R$ ${parseFloat(exp.value).toFixed(2)} 
            (${exp.category}, ${new Date(exp.date).toLocaleDateString('pt-BR')})
            <button onclick="deleteExpense('${exp.id}')">Excluir</button>
        `;
        list.appendChild(li);
    });
}

/**
 * Renderiza a lista de investimentos.
 */
function renderInvestments() {
    const list = document.getElementById('investment-list');
    list.innerHTML = '';
    currentInvestments.forEach(inv => {
        const returnPercent = (parseFloat(inv.yield) / parseFloat(inv.value) * 100).toFixed(2);
        const li = document.createElement('li');
        li.innerHTML = `
            ${inv.type} - R$ ${parseFloat(inv.value).toFixed(2)} 
            (Data: ${new Date(inv.date).toLocaleDateString('pt-BR')}, Rendimento: R$ ${parseFloat(inv.yield).toFixed(2)}, Retorno: ${returnPercent}%)
            <button onclick="deleteInvestment('${inv.id}')">Excluir</button>
        `;
        list.appendChild(li);
    });
}

/**
 * Filtra os gastos com base nos inputs.
 */
function filterExpenses() {
    const categoryFilter = document.getElementById('expense-filter-category').value.toLowerCase();
    const dateFilter = document.getElementById('expense-filter-date').value;

    const filtered = currentExpenses.filter(exp => {
        const matchesCategory = !categoryFilter || exp.category.toLowerCase().includes(categoryFilter);
        const matchesDate = !dateFilter || exp.date === dateFilter;
        return matchesCategory && matchesDate;
    });
    renderExpenses(filtered);
}

/**
 * Gera o relatório com gráfico baseado nos filtros.
 */
function generateReport() {
    const type = document.getElementById('report-filter-type').value;
    const month = parseInt(document.getElementById('report-filter-month').value);
    const year = parseInt(document.getElementById('report-filter-year').value);

    let filteredExpenses = currentExpenses;
    let filteredInvestments = currentInvestments;

    if (type === 'monthly') {
        filteredExpenses = currentExpenses.filter(exp => {
            const d = new Date(exp.date);
            return d.getFullYear() === year && (d.getMonth() + 1) === month;
        });
        filteredInvestments = currentInvestments.filter(inv => {
            const d = new Date(inv.date);
            return d.getFullYear() === year && (d.getMonth() + 1) === month;
        });
    } else if (type === 'annual') {
        filteredExpenses = currentExpenses.filter(exp => new Date(exp.date).getFullYear() === year);
        filteredInvestments = currentInvestments.filter(inv => new Date(inv.date).getFullYear() === year);
    }

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.value), 0);
    const totalInvested = filteredInvestments.reduce((sum, inv) => sum + parseFloat(inv.value), 0);

    drawChart(totalExpenses, totalInvested);
}

/**
 * Desenha um gráfico de barras simples usando Canvas API.
 * @param {number} expenses - Total de gastos.
 * @param {number} investments - Total de investimentos.
 */
function drawChart(expenses, investments) {
    const canvas = document.getElementById('report-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Barra para gastos (vermelho)
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(50, 50, 100, expenses / 10); // Escala simples
    ctx.fillStyle = '#000';
    ctx.fillText('Gastos: R$' + expenses.toFixed(2), 50, 40);

    // Barra para investimentos (verde)
    ctx.fillStyle = '#28a745';
    ctx.fillRect(200, 50, 100, investments / 10); // Escala simples
    ctx.fillStyle = '#000';
    ctx.fillText('Investimentos: R$' + investments.toFixed(2), 200, 40);
}