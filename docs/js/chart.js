let diagnosisChartInstance = null;


function createDiagnosisChart(percentage) {
    const chartCanvas = document.getElementById('diagnosisChart');
    if (!chartCanvas) {
        console.error("Chart canvas element not found");
        return;
    }

    const ctx = chartCanvas.getContext('2d');

    if (diagnosisChartInstance) {
        diagnosisChartInstance.destroy();
        diagnosisChartInstance = null;
    }

    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: function (chart) {
            const { width, height } = chart;
            const { ctx } = chart;
            ctx.restore();

            // Hiển thị phần trăm tại trung tâm
            const fontSize = (width / 8).toFixed(0);
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = percentage >= 70 ? '#b91c1c' : percentage >= 40 ? '#c2410c' : '#15803d';
            const text = percentage + '%';
            ctx.fillText(text, width / 2, height / 2);

            // Hiển thị nhãn “Nguy cơ”
            const labelFontSize = (width / 16).toFixed(0);
            ctx.font = `${labelFontSize}px sans-serif`;
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Nguy cơ', width / 2, height / 2 + parseInt(fontSize) + 5);

            ctx.save();
        }
    };

    const riskColor = percentage >= 70 ? '#ef4444' :
        percentage >= 40 ?
            '#f97316' :
            '#22c55e';

    // Tạo biểu đồ mới
    diagnosisChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Nguy cơ', 'An toàn'],
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [
                    riskColor,
                    '#e5e7eb'
                ],
                borderWidth: 0,
                borderRadius: 5,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                centerText: true
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
            }
        },
        plugins: [centerTextPlugin]
    });
}