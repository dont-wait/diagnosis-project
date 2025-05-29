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
    const resultCard = document.getElementById('resultCard');
    const adviceCard = document.getElementById('adviceCard');
    const resultContent = document.getElementById('resultContent');
    const chartContainer = document.getElementById('chartContainer');
    const aiAdviceContent = document.getElementById('aiAdviceContent');
    const getAdviceBtn = document.getElementById('getAdviceBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');
    const hideAdviceBtn = document.getElementById('hideAdviceBtn');

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

    // Gender change handler
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

    // Form submit handler
    diagnosisForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (diagnosisChartInstance) {
            diagnosisChartInstance.destroy();
            diagnosisChartInstance = null;
        }

        // Hide advice card
        adviceCard.classList.remove('active');

        // Dừng animation nếu đang chạy
        if (adviceAnimation) {
            adviceAnimation.stop();
        }

        // Show loading and fetch results
        showLoadingWithSkeleton();
    });

    // Back to form button handler
    backToFormBtn.addEventListener('click', function () {
        resetView();
    });

    // Get advice button handler
    getAdviceBtn.addEventListener('click', function () {
        fetchAdvice();
    });

    // Hide advice button handler
    hideAdviceBtn.addEventListener('click', function () {
        adviceCard.classList.remove('active');
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

    function showLoadingWithSkeleton() {
        // Hide form card with smooth transition
        formCard.style.opacity = '0';

        setTimeout(() => {
            formCard.classList.add('hidden');

            // Show result card with skeleton loading
            resultCard.classList.remove('hidden');

            // Insert skeleton loading for result content
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

            // Insert skeleton loading for chart
            chartContainer.innerHTML = `
                <div class="flex items-center justify-center">
                    <div class="skeleton w-40 h-40 skeleton-circle"></div>
                </div>
            `;

            // Activate result card with animation
            setTimeout(() => {
                resultCard.classList.add('active');

                // Scroll to result card
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Fetch results after animation completes
                setTimeout(fetchDiagnosisResult, 1500); // Longer delay to show skeleton
            }, 50);
        }, 400);
    }

    function resetView() {
        // Hide result card with animation
        resultCard.classList.remove('active');
        adviceCard.classList.remove('active');

        // Dừng animation nếu đang chạy
        if (adviceAnimation) {
            adviceAnimation.stop();
        }

        setTimeout(() => {
            resultCard.classList.add('hidden');

            // Show form card with animation
            formCard.classList.remove('hidden');
            setTimeout(() => {
                formCard.style.opacity = '1';

                // Scroll to form card
                formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        }, 400);
    }

    function fetchDiagnosisResult() {
        fetch('http://localhost:5000/predict', {
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
                if (!response.ok) {
                    throw new Error("Phản hồi không hợp lệ từ server");
                }
                return response.json();
            })
            .then(data => {
                displayResult(data);
            })
            .catch(error => {
                console.error("Có lỗi xảy ra:", error);
                resultContent.innerHTML = `
                    <div class="p-4 bg-red-50 rounded-lg text-red-600 border border-red-200">
                        <div class="flex items-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 class="font-medium">Đã xảy ra lỗi</h4>
                        </div>
                        <p class="text-sm ml-7">Không thể kết nối đến máy chủ. Vui lòng thử lại sau.</p>
                    </div>
                `;

                // Clear chart skeleton
                chartContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-sm text-gray-500">Không thể tải biểu đồ</p>
                    </div>
                `;
            });
    }

    function displayResult(data) {
        const percentage = data.risk_percentage;
        currentRiskPercentage = percentage;

        let riskLevel = '';
        let riskClass = '';
        let riskBg = '';
        let recommendation = '';

        if (percentage >= 75) {
            riskLevel = "RẤT CAO";
            riskClass = "text-red-700";
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
            riskClass = "text-orange-700";
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
            riskClass = "text-green-700";
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
                <div class="text-4xl font-bold ${riskClass} mb-2">${percentage}%</div>
                <div class="text-xl font-semibold ${riskClass}">Nguy cơ ${riskLevel}</div>
            </div>
            <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full ${percentage >= 75 ? 'bg-red-500' : percentage >= 50 ? 'bg-orange-500' : 'bg-green-500'}" style="width: ${percentage}%"></div>
            </div>
        </div>
        ${recommendation}
    `;

        // Prepare chart container
        chartContainer.innerHTML = `<canvas id="diagnosisChart" class="w-full h-40"></canvas>`;

        // Hiển thị biểu đồ
        setTimeout(() => {
            createDiagnosisChart(percentage);
        }, 100);
    }

    function fetchAdvice() {
        if (!currentRiskPercentage) {
            console.error("Không có dữ liệu về tỷ lệ rủi ro");
            return;
        }

        // Hiển thị advice card với skeleton loading
        adviceCard.classList.add('active');

        // Show skeleton loading for advice
        aiAdviceContent.innerHTML = `
            <div class="space-y-4">
            <!-- Thanh tiến trình skeleton -->
            <div class="h-1 bg-gray-200 rounded-full overflow-hidden mt-2 mb-6">
                <div class="skeleton h-full w-2/5"></div>
            </div>
            
            <!-- Tóm tắt skeleton -->
            <div class="mb-6 pb-4 border-b border-blue-200">
                <div class="skeleton w-32 h-5 mb-3"></div>
                <div class="skeleton w-full h-3 mb-2 animate-pulse"></div>
                <div class="skeleton w-5/6 h-3 mb-2 animate-pulse"></div>
                <div class="skeleton w-4/5 h-3 animate-pulse"></div>
            </div>
            
            <!-- Grid layout skeleton với nhiều chi tiết hơn -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Mức độ nguy hiểm -->
                <div>
                    <div class="flex items-center mb-2">
                        <div class="skeleton w-4 h-4 skeleton-circle mr-1"></div>
                        <div class="skeleton w-40 h-4"></div>
                    </div>
                    <div class="skeleton w-full h-3 mb-1 animate-pulse"></div>
                    <div class="skeleton w-4/5 h-3 animate-pulse"></div>
                </div>
                
                <!-- Triệu chứng cần theo dõi -->
                <div>
                    <div class="flex items-center mb-2">
                        <div class="skeleton w-4 h-4 skeleton-circle mr-1"></div>
                        <div class="skeleton w-48 h-4"></div>
                    </div>
                    <div class="skeleton w-full h-3 mb-1 animate-pulse"></div>
                    <div class="skeleton w-3/4 h-3 animate-pulse"></div>
                </div>
                
                <!-- Hành động cần thực hiện -->
                <div>
                    <div class="flex items-center mb-2">
                        <div class="skeleton w-4 h-4 skeleton-circle mr-1"></div>
                        <div class="skeleton w-56 h-4"></div>
                    </div>
                    <div class="skeleton w-full h-3 mb-1 animate-pulse"></div>
                    <div class="skeleton w-5/6 h-3 mb-1 animate-pulse"></div>
                    <div class="skeleton w-4/6 h-3 animate-pulse"></div>
                </div>
                
                <!-- Chế độ ăn uống -->
                <div>
                    <div class="flex items-center mb-2">
                        <div class="skeleton w-4 h-4 skeleton-circle mr-1"></div>
                        <div class="skeleton w-52 h-4"></div>
                    </div>
                    <div class="skeleton w-full h-3 mb-1 animate-pulse"></div>
                    <div class="skeleton w-4/5 h-3 mb-1 animate-pulse"></div>
                    <div class="skeleton w-3/5 h-3 animate-pulse"></div>
                </div>
                
                <!-- Thời điểm khám -->
                <div class="md:col-span-2">
                    <div class="flex items-center mb-2">
                        <div class="skeleton w-4 h-4 skeleton-circle mr-1"></div>
                        <div class="skeleton w-44 h-4"></div>
                    </div>
                    <div class="skeleton w-full h-3 mb-1 animate-pulse"></div>
                    <div class="skeleton w-3/4 h-3 animate-pulse"></div>
                </div>
            </div>
        </div>
    `;

        // Cuộn đến advice card
        setTimeout(() => {
            adviceCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);

        // Gọi API để lấy lời khuyên
        fetch('http://localhost:5000/get-advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                risk_percentage: parseFloat(currentRiskPercentage)
            }),
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Server trả về lỗi ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                // Delay to show skeleton loading
                setTimeout(() => {
                    displayAdviceWithAnimation(data.advice);
                }, 1000);
            })
            .catch(error => {
                console.error("Có lỗi xảy ra khi lấy lời khuyên:", error);
                // Nếu có lỗi, hiển thị lời khuyên mô phỏng sau một khoảng thời gian
                setTimeout(() => {
                    const mockAdvice = generateMockAdvice(currentRiskPercentage);
                    displayAdviceWithAnimation(mockAdvice);
                }, 1000);
            });
    }

    function displayAdviceWithAnimation(advice) {
        // Sử dụng đối tượng AdviceAnimation để hiển thị lời khuyên với hiệu ứng đánh máy
        adviceAnimation.animateAdvice(advice);
    }

    function generateMockAdvice(riskPercentage) {
        if (riskPercentage >= 75) {
            return {
                danger_level: "Rất cao - Cần can thiệp y tế ngay lập tức",
                immediate_actions: "Đến gặp bác sĩ nội tiết ngay lập tức, kiểm tra đường huyết và HbA1c, tuân thủ chế độ ăn kiêng nghiêm ngặt",
                diet: "Loại bỏ hoàn toàn đường tinh luyện, giảm tinh bột xuống dưới 100g/ngày, ưu tiên rau xanh, protein nạc và chất béo lành mạnh",
                symptoms_to_watch: "Khát nước liên tục, đi tiểu nhiều, mệt mỏi bất thường, mờ mắt, vết thương lâu lành",
                doctor_visit_timing: "Ngay lập tức - trong vòng 24-48 giờ",
                summary: "Bạn đang ở nguy cơ rất cao mắc bệnh tiểu đường. Cần can thiệp y tế ngay lập tức để ngăn ngừa các biến chứng nghiêm trọng."
            };
        } else if (riskPercentage >= 50) {
            return {
                danger_level: "Trung bình đến cao - Cần thay đổi lối sống ngay lập tức",
                immediate_actions: "Giảm lượng đường và carbohydrate tinh chế, tăng cường hoạt động thể chất, theo dõi đường huyết định kỳ",
                diet: "Giảm tinh bột xuống 150g/ngày, tăng protein nạc, chất xơ và chất béo lành mạnh, chia nhỏ bữa ăn",
                symptoms_to_watch: "Mệt mỏi sau khi ăn, thèm ăn ngọt, tăng cân bất thường, đi tiểu nhiều",
                doctor_visit_timing: "Trong vòng 1-2 tuần để kiểm tra đường huyết và HbA1c",
                summary: "Bạn đang ở giai đoạn tiền tiểu đường. Thay đổi lối sống ngay bây giờ có thể giúp ngăn ngừa tiến triển thành bệnh tiểu đường type 2."
            };
        } else {
            return {
                danger_level: "Thấp - Tiếp tục duy trì lối sống lành mạnh",
                immediate_actions: "Duy trì chế độ ăn cân bằng, tập thể dục đều đặn, theo dõi cân nặng",
                diet: "Chế độ ăn cân bằng với nhiều rau, trái cây, ngũ cốc nguyên hạt, protein nạc và chất béo lành mạnh",
                symptoms_to_watch: "Không có triệu chứng cụ thể cần theo dõi, nhưng vẫn nên chú ý đến bất kỳ thay đổi bất thường nào",
                doctor_visit_timing: "Kiểm tra sức khỏe định kỳ hàng năm",
                summary: "Nguy cơ tiểu đường của bạn hiện tại thấp. Tiếp tục duy trì lối sống lành mạnh để giữ nguy cơ ở mức thấp."
            };
        }
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
                const { width, height } = chart;
                const { ctx } = chart;
                ctx.restore();

                // Percentage text
                const fontSize = (width / 8).toFixed(0);
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = percentage >= 75 ? '#b91c1c' : percentage >= 50 ? '#c2410c' : '#15803d';
                const text = percentage + '%';
                ctx.fillText(text, width / 2, height / 2);

                // Label text
                const labelFontSize = (width / 16).toFixed(0);
                ctx.font = `${labelFontSize}px sans-serif`;
                ctx.fillStyle = '#6b7280';
                ctx.fillText('Nguy cơ', width / 2, height / 2 + parseInt(fontSize) + 5);

                ctx.save();
            }
        };

        const riskColor = percentage >= 75 ? '#ef4444' : percentage >= 50 ? '#f97316' : '#22c55e';

        // Create new chart with improved design and animation
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