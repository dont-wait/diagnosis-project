document.addEventListener('DOMContentLoaded', function() {
    const diagnosisForm = document.getElementById('diagnosisForm');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    
    diagnosisForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
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
            !glucose || !insulin || !diabetesPedigreeFunction || !pregnancies
        ) {
            alert('Vui lòng điền đầy đủ tất cả các trường thông tin.');
            return false;
        }
    
        return true;
    }
    
    function showLoading() {
        resultContainer.classList.remove('hidden');
        resultContent.innerHTML = `
            <div class="flex justify-center items-center py-4">
                <svg class="animate-spin h-8 w-8 text-primary dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-3 text-gray-700 dark:text-gray-300">Đang phân tích dữ liệu...</span>
            </div>
        `;
    }
    
    function fetchDiagnosisResult() {
        fetch('http://127.0.0.1:5000/predict', {
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
                <div class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                    Đã xảy ra lỗi trong quá trình chẩn đoán. Vui lòng thử lại sau.
                </div>
            `;
        });
    }
    
    function displayResult(data) {
        // Xử lý response { result: 0 } hoặc { result: 1 }
        const riskLevel = data.result === 1 ? "Cao" : "Thấp";
        const riskClass = data.result === 1 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";
        const riskDescription = data.result === 1
            ? "Bạn có nguy cơ cao mắc bệnh tiểu đường. Hãy tham khảo ý kiến bác sĩ để được kiểm tra và tư vấn cụ thể."
            : "Nguy cơ mắc bệnh tiểu đường của bạn hiện ở mức thấp. Tiếp tục duy trì lối sống lành mạnh!";

        resultContent.innerHTML = `
            <div class="mb-6 text-center">
                <div class="inline-block rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-3">
                    <svg class="h-8 w-8 ${riskClass}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h4 class="text-lg font-semibold mb-1">Nguy cơ tiểu đường: <span class="${riskClass}">${riskLevel}</span></h4>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mb-4">${riskDescription}</p>
            <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <h4 class="font-medium text-primary dark:text-blue-400 mb-2">Khuyến nghị:</h4>
                <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>Duy trì chế độ ăn uống cân bằng, hạn chế đường và carbohydrate tinh chế</li>
                    <li>Tập thể dục ít nhất 150 phút mỗi tuần</li>
                    <li>Kiểm tra đường huyết định kỳ</li>
                    <li>Duy trì cân nặng hợp lý</li>
                </ul>
            </div>
        `;
    }
});
