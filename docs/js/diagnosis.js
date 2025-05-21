let diagnosisChartInstance = null;


document.addEventListener('DOMContentLoaded', function () {
    const diagnosisForm = document.getElementById('diagnosisForm');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');

    const genderSelect = document.getElementById('gender');
    const pregnanciesInput = document.getElementById('pregnancies');

    genderSelect.addEventListener('change', function () {
        if (genderSelect.value === 'male') {
            pregnanciesInput.value = 0;
            pregnanciesInput.setAttribute('readonly', true);
            pregnanciesInput.classList.add('bg-gray-100', 'cursor-not-allowed');
        } else {
            pregnanciesInput.removeAttribute('readonly');
            pregnanciesInput.classList.remove('bg-gray-100', 'cursor-not-allowed');
            pregnanciesInput.value = '';
        }
    });

    diagnosisForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (diagnosisChartInstance) {
            diagnosisChartInstance.destroy();
            diagnosisChartInstance = null;
        }


        showLoading();
        setTimeout(fetchDiagnosisResult, 2000);
    });

    function validateForm() {
        const age = document.getElementById('age').value;
        const bmi = document.getElementById('bmi').value;
        const bloodPressure = document.getElementById('blood_pressure').value;
        const skinThickness = document.getElementById('skin_thickness').value;
        const glucose = document.getElementById('glucose').value;
        const insulin = document.getElementById('insulin').value;
        const diabetesPedigreeFunction = document.getElementById('diabetesPedigreeFunction').value;
        const pregnancies = document.getElementById('pregnancies').value;

        if (
            !age || !bmi || !bloodPressure || !skinThickness ||
            !glucose || !insulin || !diabetesPedigreeFunction || pregnancies === ''
        ) {
            alert('Vui lòng điền đầy đủ tất cả các trường thông tin.');
            return false;
        }

        return true;
    }

    function showLoading() {
        resultContainer.classList.remove('hidden');
        resultContent.innerHTML = `
            <canvas id="diagnosisChart" class="w-32 h-32 absolute top-4 right-4"></canvas>

            <div class="flex justify-center items-center py-4">
                <svg class="animate-spin h-8 w-8 text-primary light:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-3 text-gray-700 light:text-gray-300">Đang phân tích dữ liệu...</span>
            </div>
        `;
    }

    function fetchDiagnosisResult() {

        fetch('https://87cd-101-53-36-58.ngrok-free.app/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pregnancies: parseInt(document.getElementById('pregnancies').value),
                glucose: parseInt(document.getElementById('glucose').value),
                blood_pressure: parseInt(document.getElementById('blood_pressure').value),
                skin_thickness: parseInt(document.getElementById('skin_thickness').value),
                insulin: parseInt(document.getElementById('insulin').value),
                bmi: parseFloat(document.getElementById('bmi').value),
                diabetes_pedigree: parseFloat(document.getElementById('diabetesPedigreeFunction').value),
                age: parseInt(document.getElementById('age').value)
            }),
        })
            .then(response => {
                console.log("Response object:", response);
                if (!response.ok) {
                    throw new Error("Phản hồi không hợp lệ từ server");
                }
                return response.json();
            })
            .then(data => {
                console.log("Data nhận về:", data);
                displayResult(data);

            })
            .catch(error => {
                console.error("Có lỗi xảy ra:", error);
                resultContent.innerHTML = `
                <div class="p-4 bg-red-50 light:bg-red-900/30 rounded-lg text-red-600 light:text-red-400">
                    Đã xảy ra lỗi trong quá trình chẩn đoán. Vui lòng thử lại sau.
                </div>
            `;
            });
    }

    function displayResult(data) {
        const percentage = data.risk_percentage;
        const advice = data.advice || {};
        let riskLevel = '';
        let riskClass = '';
        let riskDescription = '';
        let recommendation = '';

        if (percentage >= 75) {
            riskLevel = "RẤT CAO";
            riskClass = "text-red-700 light:text-red-400";
            recommendation = `
            <div class="mt-4 p-4 bg-red-100 light:bg-red-900/30 rounded-lg text-red-800 light:text-red-300 border border-red-400 light:border-red-600">
                🚨 <strong>Khuyến nghị khẩn cấp:</strong> Vui lòng đến bệnh viện chuyên khoa nội tiết để làm xét nghiệm đường huyết, HbA1c và được tư vấn điều trị. Không được chủ quan!
            </div>
        `;
        } else if (percentage >= 50) {
            riskLevel = "TRUNG BÌNH";
            riskClass = "text-orange-600 light:text-orange-400";
            riskDescription = `
            Hệ thống cho thấy bạn có <strong>${percentage}%</strong> nguy cơ mắc bệnh tiểu đường. 
            Bạn hiện đang ở <strong>giai đoạn tiền tiểu đường</strong> – nếu không điều chỉnh lối sống, bệnh có thể phát triển âm thầm và gây biến chứng sau vài năm.
        `;
            recommendation = `
            <div class="mt-4 p-4 bg-orange-100 light:bg-orange-900/30 rounded-lg text-orange-800 light:text-orange-300 border border-orange-400 light:border-orange-600">
                ⚠️ <strong>Khuyến nghị:</strong> Hạn chế đường, tinh bột, nước ngọt và bắt đầu tập luyện đều đặn mỗi ngày. Theo dõi đường huyết ít nhất mỗi 3 tháng.
            </div>
        `;
        } else {
            riskLevel = "THẤP";
            riskClass = "text-green-600 light:text-green-400";
            recommendation = `
            <div class="mt-4 p-4 bg-green-100 light:bg-green-900/30 rounded-lg text-green-800 light:text-green-300 border border-green-400 light:border-green-600">
                ✅ <strong>Lời khuyên:</strong> Tiếp tục duy trì ăn uống khoa học, tập thể dục, và khám sức khỏe định kỳ.
            </div>
        `;
        }

        // Hiển thị phần nguy cơ tiểu đường
        resultContent.innerHTML = `
        <div class="mb-6 text-center">
            <div class="inline-block rounded-full bg-gray-100 light:bg-gray-700 p-3 mb-3">
                <svg class="h-8 w-8 ${riskClass}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h4 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            Nguy cơ tiểu đường:
            <span class="ml-2 px-2 py-1 rounded-full ${riskClass} bg-opacity-10 border ${riskClass.replace('text-', 'border-')}"> 
            ${riskLevel} (${percentage}%)
            </span>
            </h4>
        </div>
        ${recommendation}
    `;
        resultContainer.classList.remove('hidden');
        resultContainer.classList.add('bg-white', 'light:bg-gray-800', 'shadow-lg', 'rounded-lg', 'p-6', 'relative');

        // Hiển thị biểu đồ
        setTimeout(() => {
            createDiagnosisChart(percentage);
        }, 100);

        // Hiển thị lời khuyên từ AI
        document.getElementById('aiAdviceContainer').classList.remove('hidden');
        document.getElementById('aiAdviceContent').innerHTML = `
    <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h4 class="text-xl font-semibold mb-4 flex items-center text-blue-800">
            🧠 <span class="ml-2">Lời khuyên chi tiết từ AI</span>
        </h4>
        <div class="space-y-3 text-gray-800 text-[15px] leading-relaxed">
            <p><span class="font-semibold text-blue-700">Tóm tắt:</span> ${advice.summary || 'Không có dữ liệu'}</p>
            <p><span class="font-semibold text-blue-700">Mức độ nguy hiểm:</span> ${advice.danger_level || 'Không rõ'}</p>
            <p><span class="font-semibold text-blue-700">Triệu chứng cần theo dõi:</span> ${advice.symptoms_to_watch || 'Không rõ'}</p>
            <p><span class="font-semibold text-blue-700">Hành động cần thực hiện ngay:</span> ${advice.immediate_actions || 'Không rõ'}</p>
            <p><span class="font-semibold text-blue-700">Chế độ ăn uống khuyến nghị:</span> ${advice.diet || 'Không rõ'}</p>
            <p><span class="font-semibold text-blue-700">Thời điểm cần đi khám:</span> ${advice.doctor_visit_timing || 'Không rõ'}</p>
        </div>
    </div>
`;
    }


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
                const { width } = chart;
                const { ctx } = chart;
                ctx.restore();
                const fontSize = (width / 8).toFixed(0);
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#111';
                const text = percentage + '%';
                const textX = chart.height / 2;
                const textY = chart.height / 2;
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        };

        const riskColor = percentage >= 75 ? '#dc2626' : percentage >= 50 ? '#f97316' : '#16a34a';

        // Create new chart
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
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    centerText: true
                }
            },
            plugins: [centerTextPlugin]
        });

        console.log("New chart created:", diagnosisChartInstance);
    }

});
