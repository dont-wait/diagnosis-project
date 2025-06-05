/**
 * Diagnosis.js
 * 
 * Xử lý chức năng chẩn đoán tiểu đường và hiển thị kết quả.
 */

let diagnosisChartInstance = null;
let currentRiskPercentage = null;
let adviceAnimation = null;

document.addEventListener('DOMContentLoaded', function () {
    const diagnosisForm = document.getElementById('diagnosisForm');
    const formCard = document.getElementById('formCard');
    const resultAndAdviceCard = document.getElementById('resultAndAdviceCard'); // Cập nhật ID
    const resultContent = document.getElementById('resultContent');
    const chartContainer = document.getElementById('chartContainer');
    const aiAdviceContent = document.getElementById('aiAdviceContent');

    const genderSelect = document.getElementById('gender');
    const pregnanciesInput = document.getElementById('pregnancies');

    // Khởi tạo đối tượng AdviceAnimation
    adviceAnimation = new AdviceAnimation({
        container: aiAdviceContent,
        typingSpeed: 25,
        onComplete: () => {
            console.log('Animation completed');
        }
    });

    // Xử lý thay đổi giới tính
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

    // Xử lý sự kiện submit form
    diagnosisForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Hiển thị loading và fetch kết quả
        showLoadingWithSkeleton();
    });

    // Hàm xác thực form
    function validateForm() {
        const inputs = [
            document.getElementById('age').value,
            document.getElementById('bmi').value,
            document.getElementById('blood_pressure').value,
            document.getElementById('skin_thickness').value,
            document.getElementById('glucose').value,
            document.getElementById('insulin').value,
            document.getElementById('diabetesPedigreeFunction').value,
            pregnanciesInput.value
        ];

        if (inputs.some(input => !input)) {
            alert('Vui lòng điền đầy đủ tất cả các trường thông tin.');
            return false;
        }

        return true;
    }

    // Hàm hiển thị skeleton loading
    function showLoadingWithSkeleton() {
        // Hiển thị skeleton loading cho kết quả
        resultContent.innerHTML = `
            <div class="p-5 bg-gray-100 rounded-lg mb-6">
                <div class="flex flex-col items-center text-center mb-4">
                    <div class="skeleton w-20 h-20 skeleton-circle mb-3"></div>
                    <div class="skeleton w-32 h-6 mb-2"></div>
                    <div class="skeleton w-24 h-4"></div>
                </div>
                <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div class="skeleton h-full w-full"></div>
                </div>
            </div>
            <div class="mt-6 p-4 bg-gray-100 rounded-lg">
                <div class="flex items-start">
                    <div class="flex-shrink-0 mt-0.5">
                        <div class="skeleton w-5 h-5 skeleton-circle"></div>
                    </div>
                    <div class="ml-3 w-full">
                        <div class="skeleton w-32 h-4 mb-2"></div>
                        <div class="skeleton w-full h-3 mb-1"></div>
                        <div class="skeleton w-4/5 h-3"></div>
                    </div>
                </div>
            </div>
        `;

        chartContainer.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="skeleton w-40 h-40 skeleton-circle"></div>
            </div>
        `;

        // Gọi hàm lấy kết quả chẩn đoán
        setTimeout(fetchDiagnosisResult, 1500); // Gọi hàm lấy kết quả sau khi hiển thị skeleton
    }

    // Hàm lấy kết quả chẩn đoán
    function fetchDiagnosisResult() {
        fetch('https://diagnosis-project.onrender.com/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pregnancies: parseInt(pregnanciesInput.value),
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
                if (!response.ok) {
                    throw new Error("Phản hồi không hợp lệ từ server");
                }
                return response.json();
            })
            .then(data => {
                displayResult(data);
                fetchAdvice(); // Lấy lời khuyên sau khi có kết quả
            })
            .catch(error => {
                console.error("Có lỗi xảy ra:", error);
                resultContent.innerHTML = `
                <div class="p-4 bg-red-50 rounded-lg text-red-600 border border-red-200">
                    <h4 class="font-medium">Đã xảy ra lỗi</h4>
                    <p class="text-sm ml-7">Không thể kết nối đến máy chủ. Vui lòng thử lại sau.</p>
                </div>
            `;
            });
    }

    // Hàm hiển thị kết quả
    function displayResult(data) {
        const percentage = data.risk_percentage;
        currentRiskPercentage = percentage;

        let riskLevel = '';
        let riskBg = '';
        let recommendation = '';

        if (percentage >= 75) {
            riskLevel = "RẤT CAO";
            riskBg = "bg-red-50 border-red-200";
            recommendation = `
                <div class="mt-6 p-4 bg-red-50 rounded-lg text-red-800 border border-red-200">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">Khuyến nghị khẩn cấp:</h3>
                            <div class="mt-2 text-sm text-red-700 text-justify">
                                <p>Vui lòng đến bệnh viện chuyên khoa nội tiết để làm xét nghiệm đường huyết, HbA1c và được tư vấn điều trị. Không được chủ quan!</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (percentage >= 50) {
            riskLevel = "TRUNG BÌNH";
            riskBg = "bg-orange-50 border-orange-200";
            recommendation = `
                <div class="mt-6 p-4 bg-orange-50 rounded-lg text-orange-800 border border-orange-200">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-orange-800">Khuyến nghị:</h3>
                            <div class="mt-2 text-sm text-orange-700 text-justify">
                                <p>Hạn chế đường, tinh bột, nước ngọt và bắt đầu tập luyện đều đặn mỗi ngày. Theo dõi đường huyết ít nhất mỗi 3 tháng.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            riskLevel = "THẤP";
            riskBg = "bg-green-50 border-green-200";
            recommendation = `
                <div class="mt-6 p-4 bg-green-50 rounded-lg text-green-800 border border-green-200">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-green-800">Lời khuyên:</h3>
                            <div class="mt-2 text-sm text-green-700 text-justify">
                                <p>Tiếp tục duy trì ăn uống khoa học, tập thể dục, và khám sức khỏe định kỳ.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Hiển thị kết quả với thiết kế mới
        resultContent.innerHTML = `
            <div class="p-5 ${riskBg} rounded-lg mb-6">
                <div class="flex flex-col items-center text-center mb-4">
                    <div class="text-xl font-semibold">Nguy cơ ${riskLevel}</div>
                </div>
                <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full ${percentage >= 75 ? 'bg-red-500' : percentage >= 50 ? 'bg-orange-500' : 'bg-green-500'}" style="width: ${percentage}%"></div>
                </div>
            </div>
            ${recommendation}
        `;

        // Chuẩn bị cho biểu đồ
        chartContainer.innerHTML = `<canvas id="diagnosisChart" class="w-full h-40"></canvas>`;

        // Hiển thị biểu đồ
        setTimeout(() => {
            createDiagnosisChart(percentage);
        }, 100);
    }

    // Hàm lấy lời khuyên
    function fetchAdvice() {
        if (!currentRiskPercentage) {
            console.error("Không có dữ liệu về tỷ lệ rủi ro");
            return;
        }

        // Hiển thị skeleton loading cho lời khuyên
        aiAdviceContent.innerHTML = `
            <div class="space-y-4">
                <div class="h-1 bg-gray-200 rounded-full overflow-hidden mt-2 mb-6">
                    <div class="skeleton h-full w-2/5"></div>
                </div>
                <div class="mb-6 pb-4 border-b border-blue-200">
                    <div class="skeleton w-32 h-5 mb-3"></div>
                    <div class="skeleton w-full h-3 mb-2 animate-pulse"></div>
                </div>
            </div>
        `;

        // Gọi API để lấy lời khuyên
        fetch('https://diagnosis-project.onrender.com/get-advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                risk_percentage: parseFloat(currentRiskPercentage)
            }),
        })
            .then(response => response.json())
            .then(data => {
                // Hiển thị lời khuyên sau khi có dữ liệu
                setTimeout(() => {
                    displayAdviceWithAnimation(data.advice);
                }, 1000);
            })
            .catch(error => {
                console.error("Có lỗi xảy ra khi lấy lời khuyên:", error);
                // Hiển thị lời khuyên giả nếu có lỗi
                setTimeout(() => {
                    const mockAdvice = generateMockAdvice(currentRiskPercentage);
                    displayAdviceWithAnimation(mockAdvice);
                }, 1000);
            });
    }

    // Hàm hiển thị lời khuyên với hiệu ứng
    function displayAdviceWithAnimation(advice) {
        adviceAnimation.animateAdvice(advice);
    }

    // Hàm tạo biểu đồ chẩn đoán
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
                ctx.fillStyle = percentage >= 75 ? '#b91c1c' : percentage >= 50 ? '#c2410c' : '#15803d';
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

        const riskColor = percentage >= 75 ? '#ef4444' : percentage >= 50 ? '#f97316' : '#22c55e';

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
});