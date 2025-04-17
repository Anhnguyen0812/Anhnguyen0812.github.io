// Khởi tạo scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Thêm sương mù cho chiều sâu
scene.fog = new THREE.Fog(0x87ceeb, 20, 60);

// Thêm ánh sáng môi trường và ánh sáng bán cầu
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.5);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Đèn chính (DirectionalLight) bật bóng đổ
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
scene.add(light);

// Renderer bật shadow
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Thêm mặt đất (ground)
const groundGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x6b8e23, roughness: 0.7, metalness: 0.2 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Đặt màu nền bầu trời
scene.background = new THREE.Color(0x87ceeb); // màu xanh da trời

// Máy bay (vẽ thật hơn)
function createPlayerPlane() {
    const group = new THREE.Group();
    
    // Thân chính (hướng dọc trục z)
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 2.2, 24),
        new THREE.MeshPhysicalMaterial({ color: 0x3a8ee5, roughness: 0.25, metalness: 0.8, clearcoat: 0.7 })
    );
    body.rotation.x = Math.PI / 2; // Đặt thân nằm dọc trục z
    body.castShadow = true;
    group.add(body);
    
    // Mũi máy bay (cong và màu xanh đậm hơn)
    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshPhysicalMaterial({ color: 0x73b5ee, roughness: 0.2, metalness: 0.8 })
    );
    nose.position.z = 1.1;
    nose.rotation.x = Math.PI / 2; // Sửa lại góc này để mũi hướng đúng
    nose.castShadow = true;
    group.add(nose);
    
    // Cánh chính - lớn hơn và màu xanh với viền vàng
    const wing = new THREE.Group();
    
    // Phần cánh chính - màu xanh
    const mainWing = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.08, 0.8),
        new THREE.MeshPhysicalMaterial({ color: 0x3a8ee5, roughness: 0.4, metalness: 0.7 })
    );
    mainWing.castShadow = true;
    wing.add(mainWing);
    
    // Sọc vàng dọc cánh
    const wingStripe = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.082, 0.2),
        new THREE.MeshPhysicalMaterial({ color: 0xf7ba3e, roughness: 0.3, metalness: 0.7 })
    );
    wingStripe.position.z = 0.3;
    wing.add(wingStripe);
    
    wing.position.y = 0;
    wing.position.z = 0;
    group.add(wing);
    
    // Động cơ bên trái
    const engineLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16),
        new THREE.MeshPhysicalMaterial({ color: 0x555555, roughness: 0.3, metalness: 0.9 })
    );
    engineLeft.position.set(-1.0, -0.1, 0);
    engineLeft.rotation.x = Math.PI / 2;
    engineLeft.castShadow = true;
    group.add(engineLeft);
    
    // Cánh quạt động cơ trái
    const propellerLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.04, 0.04),
        new THREE.MeshPhysicalMaterial({ color: 0xdddddd, roughness: 0.3, metalness: 0.7 })
    );
    propellerLeft.position.set(-1.0, -0.1, 0.25);
    propellerLeft.castShadow = true;
    group.add(propellerLeft);
    
    // Động cơ bên phải
    const engineRight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16),
        new THREE.MeshPhysicalMaterial({ color: 0x555555, roughness: 0.3, metalness: 0.9 })
    );
    engineRight.position.set(1.0, -0.1, 0);
    engineRight.rotation.x = Math.PI / 2;
    engineRight.castShadow = true;
    group.add(engineRight);
    
    // Cánh quạt động cơ phải
    const propellerRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.04, 0.04),
        new THREE.MeshPhysicalMaterial({ color: 0xdddddd, roughness: 0.3, metalness: 0.7 })
    );
    propellerRight.position.set(1.0, -0.1, 0.25);
    propellerRight.castShadow = true;
    group.add(propellerRight);
    
    // Buồng lái dạng bóng kính
    const cockpit = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshPhysicalMaterial({ color: 0x99d9ea, roughness: 0.05, metalness: 0.5, transparent: true, opacity: 0.7 })
    );
    cockpit.position.z = 0.6;
    cockpit.position.y = 0.2;
    cockpit.rotation.x = -Math.PI / 2;
    cockpit.castShadow = false;
    group.add(cockpit);
    
    // Đuôi chữ T
    // Thân đuôi dọc
    const verticalTail = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.6, 0.5),
        new THREE.MeshPhysicalMaterial({ color: 0x3a8ee5, roughness: 0.4, metalness: 0.7 })
    );
    verticalTail.position.z = -0.9;
    verticalTail.position.y = 0.3;
    verticalTail.castShadow = true;
    group.add(verticalTail);
    
    // Sọc vàng trên đuôi dọc
    const tailStripeVertical = new THREE.Mesh(
        new THREE.BoxGeometry(0.082, 0.4, 0.15),
        new THREE.MeshPhysicalMaterial({ color: 0xf7ba3e, roughness: 0.3, metalness: 0.7 })
    );
    tailStripeVertical.position.z = -0.9;
    tailStripeVertical.position.y = 0.3;
    group.add(tailStripeVertical);
    
    // Cánh đuôi ngang (trên đỉnh đuôi dọc)
    const horizontalTail = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.05, 0.3),
        new THREE.MeshPhysicalMaterial({ color: 0x3a8ee5, roughness: 0.5, metalness: 0.6 })
    );
    horizontalTail.position.z = -0.9;
    horizontalTail.position.y = 0.6;
    horizontalTail.castShadow = true;
    group.add(horizontalTail);
    
    // Sọc vàng trên đuôi ngang
    const tailStripeHorizontal = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.052, 0.1),
        new THREE.MeshPhysicalMaterial({ color: 0xf7ba3e, roughness: 0.3, metalness: 0.7 })
    );
    tailStripeHorizontal.position.z = -0.9;
    tailStripeHorizontal.position.y = 0.6;
    group.add(tailStripeHorizontal);
    
    // Sọc vàng dọc thân
    const bodyStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.1, 2.2),
        new THREE.MeshPhysicalMaterial({ color: 0xf7ba3e, roughness: 0.3, metalness: 0.7 })
    );
    bodyStripe.position.y = 0.26;
    bodyStripe.position.x = 0;
    bodyStripe.castShadow = false;
    group.add(bodyStripe);
    
    // Thêm ký hiệu "G-AASS" giống trên cánh máy bay trong hình
    const texture = new THREE.CanvasTexture(createTextTexture("G-AASS"));
    const textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.15),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    textPlane.rotation.x = -Math.PI / 2;
    textPlane.position.set(0, 0.042, 0.2);
    wing.add(textPlane);
    
    group.position.y = 1;
    group.castShadow = true;
    
    // Sửa hướng máy bay: xoay 180 độ để đầu và đuôi đúng chiều
    // Máy bay ban đầu được xây dựng hướng về +Z, nhưng trong game hướng bay là -Z
    group.rotation.y = Math.PI;
    
    // Biến lưu trạng thái cánh quạt để animation
    group.userData = {
        propellerAngle: 0,
        // Thêm các thuộc tính động học cho máy bay
        velocity: 0,
        maxVelocity: 0.3,
        acceleration: 0.005,
        deceleration: 0.002,
        brakeStrength: 0.01,  // Mức độ phanh khi nhấn chuột phải
        rotationVelocity: new THREE.Vector3(0, 0, 0),
        // Thêm biến hướng bay mặc định để đảm bảo máy bay di chuyển đúng hướng
        forwardDirection: new THREE.Vector3(0, 0, 1),
        // Thêm biến điều khiển cho chế độ chuột vô hạn
        mouseControl: {
            yaw: 0,       // Góc quay ngang (trái/phải)
            pitch: 0,     // Góc ngẩng lên/cúi xuống
            bankAngle: 0, // Góc nghiêng
            sensitivity: 0.003 // Độ nhạy khi di chuyển chuột
        },
        // Thêm cài đặt cho camera theo máy bay
        cameraSettings: {
            distance: 8,      // Khoảng cách từ máy bay đến camera
            height: 2,        // Độ cao của camera so với máy bay
            smoothness: 0.05  // Độ mượt khi camera di chuyển (0-1)
        }
    };
    
    return group;
}

// Hàm tạo texture chứa text
function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'Bold 40px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#f7ba3e';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    return canvas;
}

const plane = createPlayerPlane();
scene.add(plane);

// Cây cối (dùng khối vuông)
function addTree(x, z) {
    // Thân cây là khối vuông
    const trunk = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.5, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.8 })
    );
    trunk.position.set(x, 0.25, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    // Tán lá là khối vuông
    const leaves = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.5, metalness: 0.2 })
    );
    leaves.position.set(x, 0.7, z);
    leaves.castShadow = true;
    scene.add(leaves);
}
for (let i = 0; i < 20; i++) {
    addTree(Math.random() * 40 - 20, Math.random() * 40 - 20);
}

// Đám mây (dùng khối vuông)
function addCloud(x, y, z) {
    const cloud = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.7, 0.7),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.8, transmission: 0.7, transparent: true, opacity: 0.85 })
    );
    cloud.position.set(x, y, z);
    cloud.castShadow = false;
    scene.add(cloud);
}
for (let i = 0; i < 10; i++) {
    addCloud(Math.random() * 40 - 20, Math.random() * 5 + 5, Math.random() * 40 - 20);
}

// Đạn
const bullets = [];
function shootBullet() {
    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 12),
        new THREE.MeshPhysicalMaterial({ color: 0xff0000, roughness: 0.2, metalness: 0.8 })
    );
    
    // Đặt đạn ở mũi máy bay
    bullet.position.copy(plane.position);
    
    // Sửa lại hướng bắn - sau khi xoay 180 độ, hướng bay là +Z
    const planeDirection = new THREE.Vector3(0, 0, 1);
    planeDirection.applyQuaternion(plane.quaternion);
    
    // Đặt đạn ở vị trí mũi máy bay
    bullet.position.addScaledVector(planeDirection, 1.5);
    bullet.position.y += 0.1;
    bullet.castShadow = true;
    scene.add(bullet);
    bullets.push(bullet);
    
    // Thêm thông tin hướng vào đạn để di chuyển theo hướng đó
    bullet.userData = { direction: planeDirection };
}

// Máy bay địch
const enemies = [];
function addEnemy(x, z) {
    // Thân máy bay
    const bodyGeometry = new THREE.BoxGeometry(0.4, 0.2, 1.5, 8, 2, 8);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: 0xff3333, roughness: 0.3, metalness: 0.7, clearcoat: 0.5 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0, 0);
    body.castShadow = true;

    // Cánh máy bay
    const wingGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.3, 8, 2, 2);
    const wingMaterial = new THREE.MeshPhysicalMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.6 });
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.position.set(0, 0, 0.1);
    wing.castShadow = true;

    // Đuôi đứng
    const tailGeometry = new THREE.BoxGeometry(0.1, 0.25, 0.3, 2, 4, 2);
    const tailMaterial = new THREE.MeshPhysicalMaterial({ color: 0x222222, roughness: 0.7 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.15, -0.6);
    tail.castShadow = true;

    // Nhóm các bộ phận lại
    const enemy = new THREE.Group();
    enemy.add(body);
    enemy.add(wing);
    enemy.add(tail);
    enemy.position.set(x, 1, z);
    enemy.castShadow = true;
    scene.add(enemy);
    enemies.push(enemy);
}
// Thêm 5 máy bay địch ở các vị trí ngẫu nhiên phía trước
for (let i = 0; i < 5; i++) {
    addEnemy(Math.random() * 30 - 15, -10 - Math.random() * 20);
}

// Đạn của địch
const enemyBullets = [];

function shootEnemyBullet(enemy) {
    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 12),
        new THREE.MeshPhysicalMaterial({ color: 0xffff00, roughness: 0.2, metalness: 0.8 })
    );
    bullet.position.copy(enemy.position);
    // Tính hướng bắn về phía máy bay người chơi
    const direction = new THREE.Vector3();
    direction.subVectors(plane.position, enemy.position).normalize();
    bullet.userData = { direction };
    bullet.castShadow = true;
    scene.add(bullet);
    enemyBullets.push(bullet);
}

// Thời gian bắn của từng máy bay địch
const enemyShootTimers = Array(5).fill(0);

// Điều khiển
const keys = {};
const mouse = { left: false, right: false };

// Lắng nghe sự kiện bàn phím
document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Lắng nghe sự kiện chuột
document.addEventListener('mousedown', (e) => {
    if (e.button === 0) mouse.left = true;  // Chuột trái
    if (e.button === 2) mouse.right = true; // Chuột phải
});

document.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.left = false;
    if (e.button === 2) mouse.right = false;
});

// Ngăn menu chuột phải hiện ra khi chơi game
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Bắn đạn với phím Space
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') shootBullet();
});

// Tạo hướng dẫn cho người chơi
function createInstructions() {
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.top = '10px';
    instructions.style.width = '100%';
    instructions.style.textAlign = 'center';
    instructions.style.color = '#ffffff';
    instructions.style.backgroundColor = 'rgba(0,0,0,0.5)';
    instructions.style.padding = '10px';
    instructions.style.fontFamily = 'Arial';
    instructions.style.fontSize = '14px';
    instructions.innerHTML = 'Nhấp chuột vào khu vực chơi để bắt đầu<br>' +
                          'Chuột trái: Tăng ga, Chuột phải: Phanh<br>' +
                          'Phím mũi tên: Điều khiển máy bay<br>' +
                          'Phím Space: Bắn đạn<br>' +
                          'ESC: Thoát chế độ chuột vô hạn';
    document.body.appendChild(instructions);
    return instructions;
}

const instructions = createInstructions();

// Thiết lập chế độ chuột vô hạn với Pointer Lock API
function setupPointerLock() {
    const canvas = renderer.domElement;
    
    // Yêu cầu khóa con trỏ khi nhấp vào canvas
    canvas.addEventListener('click', function() {
        canvas.requestPointerLock = canvas.requestPointerLock || 
                                    canvas.mozRequestPointerLock ||
                                    canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
    });
    
    // Chức năng xử lý khi trạng thái Pointer Lock thay đổi
    function pointerLockChange() {
        if (document.pointerLockElement === canvas || 
            document.mozPointerLockElement === canvas ||
            document.webkitPointerLockElement === canvas) {
            // Pointer đã được khóa, kích hoạt điều khiển
            document.addEventListener('mousemove', updateMouseMovement, false);
            instructions.style.display = 'none';
        } else {
            // Pointer đã được mở khóa
            document.removeEventListener('mousemove', updateMouseMovement, false);
            instructions.style.display = 'block';
        }
    }
    
    // Xử lý chuyển động chuột trong chế độ Pointer Lock
    function updateMouseMovement(e) {
        const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        
        // Cập nhật điều khiển máy bay dựa trên chuyển động chuột
        const mouseControl = plane.userData.mouseControl;
        
        // Cập nhật góc yaw (quay trái/phải) dựa trên chuyển động ngang
        mouseControl.yaw -= movementX * mouseControl.sensitivity;
        
        // Cập nhật góc pitch (ngẩng lên/cúi xuống) dựa trên chuyển động dọc
        mouseControl.pitch -= movementY * mouseControl.sensitivity;
           
        // Giới hạn góc pitch để tránh lật ngược
        mouseControl.pitch = Math.max(-Math.PI/4, Math.min(Math.PI/4, mouseControl.pitch));
        
        // Đồng thời tạo góc nghiêng khi quay trái/phải
        mouseControl.bankAngle = -movementX * mouseControl.sensitivity * 2;
    }
        
    // Đăng ký sự kiện Pointer Lock
    document.addEventListener('pointerlockchange', pointerLockChange, false);
    document.addEventListener('mozpointerlockchange', pointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
}

// Thiết lập điều khiển chuột vô hạn
setupPointerLock();

// Camera
camera.position.set(0, 3, 8);
camera.lookAt(0, 1, 0);

// Biến lưu vị trí chuột
let mouseX = 0;
let mouseY = 0;
// Lắng nghe sự kiện di chuyển chuột
window.addEventListener('mousemove', (e) => {
    // mouseX: [-1, 1] khi chuột ở trái/phải màn hình
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    // mouseY: [-1, 1] khi chuột ở trên/dưới màn hình
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Vòng lặp game
function animate() {
    requestAnimationFrame(animate);
    
    // Các biến cần thiết cho chuyển động máy bay
    const planeData = plane.userData;
    const mouseControl = planeData.mouseControl;
    
    // Xử lý vận tốc và gia tốc dựa trên chuột
    if (mouse.left) {
        // Tăng tốc khi nhấn chuột trái
        planeData.velocity += planeData.acceleration;
        if (planeData.velocity > planeData.maxVelocity) {
            planeData.velocity = planeData.maxVelocity;
        }
    } else if (mouse.right) {
        // Phanh khi nhấn chuột phải
        planeData.velocity -= planeData.brakeStrength;
        if (planeData.velocity < 0) {
            planeData.velocity = 0;
        }
    } else {
        // Giảm tốc dần khi không nhấn nút nào
        planeData.velocity -= planeData.deceleration;
        if (planeData.velocity < 0) {
            planeData.velocity = 0;
        }
    }
    
    // Xử lý nghiêng và quay - kết hợp giữa bàn phím và chuột
    let targetBankAngle = mouseControl.bankAngle;    // Bắt đầu với giá trị từ chuột
    let targetPitchAngle = mouseControl.pitch;       // Bắt đầu với giá trị từ chuột
    let targetYawRate = 0;
    
    // Kết hợp đầu vào từ bàn phím nếu được nhấn
    if (keys['ArrowUp']) {
        targetPitchAngle -= Math.PI / 15; // Ngẩng mũi lên thêm
    }
    if (keys['ArrowDown']) {
        targetPitchAngle += Math.PI / 15; // Cúi mũi xuống thêm
    }
    if (keys['ArrowLeft']) {
        targetBankAngle += Math.PI / 8;   // Nghiêng trái thêm
        targetYawRate = 0.02;
    }
    if (keys['ArrowRight']) {
        targetBankAngle -= Math.PI / 8;   // Nghiêng phải thêm
        targetYawRate = -0.02;
    }
    
    // Giới hạn góc nghiêng
    targetBankAngle = Math.max(-Math.PI/3, Math.min(Math.PI/3, targetBankAngle));
    
    // Áp dụng chuyển động mượt cho máy bay
    plane.rotation.z += (targetBankAngle - plane.rotation.z) * 0.1;
    plane.rotation.x += (targetPitchAngle - plane.rotation.x) * 0.1;
    
    // Quay máy bay theo trục y (yaw) dựa trên chuột
    if (planeData.velocity > 0) {
        plane.rotation.y += mouseControl.yaw * 0.05;
        
        // Reset yaw từ chuột để tránh quay liên tục
        mouseControl.yaw *= 0.95;
        
        // Thêm yaw từ bàn phím nếu có
        if (targetYawRate !== 0) {
            plane.rotation.y += targetYawRate;
        }
        
        // Làm mờ dần góc nghiêng khi không có đầu vào
        mouseControl.bankAngle *= 0.9;
    }
    
    // Di chuyển máy bay theo hướng nó đang bay
    if (planeData.velocity > 0) {
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(plane.quaternion);
        
        // Di chuyển máy bay theo hướng đó với vận tốc hiện tại
        plane.position.addScaledVector(direction, planeData.velocity);
        
        // Nếu nghiêng xuống, di chuyển xuống theo độ nghiêng
        if (plane.rotation.x > 0) {
            plane.position.y -= plane.rotation.x * planeData.velocity * 0.5;
            // Giới hạn độ cao tối thiểu
            if (plane.position.y < 1) {
                plane.position.y = 1;
            }
        }
        // Nếu nghiêng lên, di chuyển lên theo độ nghiêng
        else if (plane.rotation.x < 0) {
            plane.position.y -= plane.rotation.x * planeData.velocity * 0.5;
            // Giới hạn độ cao tối đa
            if (plane.position.y > 10) {
                plane.position.y = 10;
            }
        }
    }
    
    // Giới hạn vùng bay
    plane.position.x = Math.max(-20, Math.min(20, plane.position.x));
    plane.position.z = Math.max(-20, Math.min(20, plane.position.z));
    
    // Quay cánh quạt máy bay
    plane.children.forEach(child => {
        if (child.position.z === 0.25 && (child.position.x === -1.0 || child.position.x === 1.0)) {
            child.rotation.y += 0.4 + planeData.velocity * 5; // Tốc độ quay tỷ lệ với vận tốc máy bay
        }
    });
    
    // Cập nhật vị trí đạn, máy bay địch, xử lý các va chạm
    // Di chuyển đạn
    for (let i = bullets.length - 1; i >= 0; i--) {
        // Di chuyển theo hướng của đạn
        bullets[i].position.addScaledVector(bullets[i].userData.direction, 0.5);
           
        // Xóa đạn nếu bay quá xa
        if (bullets[i].position.distanceTo(plane.position) > 50) {
            scene.remove(bullets[i]);
            bullets.splice(i, 1);
        }
    }
    
    // Di chuyển máy bay địch thông minh
    for (let i = 0; i < enemies.length; i++) {
        // Hướng về phía máy bay người chơi
        const enemy = enemies[i];
        const toPlayer = new THREE.Vector3();
        toPlayer.subVectors(plane.position, enemy.position);
        // Chỉ di chuyển theo trục x và z
        toPlayer.y = 0;
        toPlayer.normalize();
        // Tốc độ đuổi
        enemy.position.x += toPlayer.x * 0.04;
        enemy.position.z += 0.05 + toPlayer.z * 0.03;
        // Nếu máy bay địch vượt qua người chơi thì reset lại phía xa
        if (enemy.position.z > 20) {
            enemy.position.z = -20 - Math.random() * 20;
            enemy.position.x = Math.random() * 30 - 15;
        }
        // Bắn đạn về phía người chơi mỗi 1.5 giây
        enemyShootTimers[i] -= 1/60;
        if (enemyShootTimers[i] <= 0) {
            shootEnemyBullet(enemy);
            enemyShootTimers[i] = 1.5 + Math.random();
        }
    }
    // Di chuyển đạn của địch
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.position.addScaledVector(bullet.userData.direction, 0.25);
        // Nếu đạn bay quá xa thì xóa
        if (bullet.position.distanceTo(plane.position) > 50) {
            scene.remove(bullet);
            enemyBullets.splice(i, 1);
        }
    }
    // Di chuyển máy bay địch
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].position.z += 0.05; // Tiến về phía người chơi
        // Nếu máy bay địch vượt qua người chơi thì reset lại phía xa
        if (enemies[i].position.z > 20) {
            enemies[i].position.z = -20 - Math.random() * 20;
            enemies[i].position.x = Math.random() * 30 - 15;
        }
    }
    // Di chuyển camera theo hướng máy bay
    const cameraSettings = planeData.cameraSettings;
    const angle = mouseX * Math.PI / 4; // Góc xoay trái/phải tối đa 45 độ
    // Tính vị trí camera dựa trên hướng của máy bay
    const radius = cameraSettings.distance;
    const pitch = mouseY * Math.PI / 8; // Độ cao camera thay đổi theo mouseY
    
    // Vector hướng ngược với hướng máy bay (để camera ở phía sau)
    const backward = new THREE.Vector3(0, 0, -1);
    backward.applyQuaternion(plane.quaternion);
    
    // Vị trí mong muốn của camera: phía sau máy bay một khoảng cách
    const targetCameraPosition = new THREE.Vector3();
    targetCameraPosition.copy(plane.position);
    targetCameraPosition.addScaledVector(backward, cameraSettings.distance);
    targetCameraPosition.y += cameraSettings.height;
    
    // Di chuyển camera mượt đến vị trí mới
    camera.position.lerp(targetCameraPosition, cameraSettings.smoothness);
    
    // Camera luôn nhìn vào máy bay - nhìn hơi cao hơn máy bay một chút để tạo góc nhìn đẹp hơn
    const lookAtPosition = new THREE.Vector3();
    lookAtPosition.copy(plane.position);
    lookAtPosition.y += 0.5; // Nhìn cao hơn máy bay một chút
    camera.lookAt(lookAtPosition);
    
    renderer.render(scene, camera);
}
animate();