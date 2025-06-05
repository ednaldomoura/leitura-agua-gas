document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reading-form');
    const historyDiv = document.getElementById('history');

    function getReadings() {
        return JSON.parse(localStorage.getItem('readings') || '[]');
    }

    function saveReadings(readings) {
        localStorage.setItem('readings', JSON.stringify(readings));
    }

    function renderHistory() {
        const readings = getReadings().sort((a, b) => new Date(b.date) - new Date(a.date));
        if (readings.length === 0) {
            historyDiv.innerHTML = '<p>Nenhuma leitura registrada ainda.</p>';
            return;
        }
        let html = '<table class="reading-table"><thead><tr><th>Tipo</th><th>Data</th><th>Leitura (m³)</th><th>Consumo</th></tr></thead><tbody>';
        let lastValues = { agua: null, gas: null };
        readings.forEach(reading => {
            let consumo = '-';
            if (lastValues[reading.type] !== null) {
                consumo = (lastValues[reading.type] - reading.value).toFixed(2) + ' m³';
            }
            html += `<tr><td>${reading.type === 'agua' ? 'Água' : 'Gás'}</td><td>${reading.date}</td><td>${reading.value}</td><td>${consumo}</td></tr>`;
            lastValues[reading.type] = reading.value;
        });
        html += '</tbody></table>';
        historyDiv.innerHTML = html;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = document.getElementById('type').value;
        const date = document.getElementById('date').value;
        const value = parseFloat(document.getElementById('value').value);
        if (!date || isNaN(value)) {
            alert('Preencha todos os campos corretamente.');
            return;
        }
        const readings = getReadings();
        readings.unshift({ type, date, value });
        saveReadings(readings);
        renderHistory();
        form.reset();
    });

    renderHistory();

    // Adiciona funcionalidade para limpar o histórico
    const clearBtn = document.getElementById('clear-history');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja apagar todo o histórico?')) {
                localStorage.removeItem('readings');
                renderHistory();
            }
        });
    }

    // Exportar CSV
    const exportCsvBtn = document.getElementById('export-csv');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', function() {
            const readings = getReadings();
            if (readings.length === 0) {
                alert('Nenhum dado para exportar.');
                return;
            }
            let csv = 'Tipo,Data,Leitura (m³)\n';
            readings.forEach(r => {
                csv += `${r.type === 'agua' ? 'Água' : 'Gás'},${r.date},${r.value}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'leituras-agua-gas.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Exportar PDF
    const exportPdfBtn = document.getElementById('export-pdf');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            const readings = getReadings();
            if (readings.length === 0) {
                alert('Nenhum dado para exportar.');
                return;
            }
            let win = window.open('', '', 'width=800,height=600');
            win.document.write('<html><head><title>Leituras de Água e Gás</title>');
            win.document.write('<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:center;}th{background:#f0f8ff;}</style>');
            win.document.write('</head><body>');
            win.document.write('<h2>Leituras de Água e Gás</h2>');
            win.document.write('<table><thead><tr><th>Tipo</th><th>Data</th><th>Leitura (m³)</th></tr></thead><tbody>');
            readings.forEach(r => {
                win.document.write(`<tr><td>${r.type === 'agua' ? 'Água' : 'Gás'}</td><td>${r.date}</td><td>${r.value}</td></tr>`);
            });
            win.document.write('</tbody></table>');
            win.document.write('</body></html>');
            win.document.close();
            win.print();
        });
    }
});
