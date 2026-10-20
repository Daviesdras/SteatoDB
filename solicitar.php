<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

header('Content-Type: application/json; charset=utf-8');

function resposta(int $status, bool $ok, string $mensagem): void
{
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'mensagem' => $mensagem], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    resposta(405, false, 'Método não permitido.');
}

require __DIR__ . '/vendor/autoload.php';
$config = require __DIR__ . '/config.php';

// Honeypot: campo escondido que só robôs preenchem.
// Responde "sucesso" para não dar pista ao robô.
if (!empty($_POST['website'])) {
    resposta(200, true, 'Pronto! Verifique seu e-mail.');
}

// ---------- Validação ----------
$email  = trim((string)($_POST['email'] ?? ''));
$aceite = isset($_POST['aceite']);

if ($email === '' || strlen($email) > 255 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    resposta(422, false, 'Informe um e-mail válido.');
}
if (!$aceite) {
    resposta(422, false, 'É necessário aceitar a licença e os termos de uso.');
}

$ip = $_SERVER['REMOTE_ADDR'] ?? null;

// ---------- Banco ----------
try {
    $db = $config['db'];
    $pdo = new PDO(
        "mysql:host={$db['host']};dbname={$db['nome']};charset=utf8mb4",
        $db['usuario'],
        $db['senha'],
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    error_log('Erro de conexão: ' . $e->getMessage());
    resposta(500, false, 'Erro interno. Tente novamente mais tarde.');
}

try {
    // Limite de pedidos por IP na última hora
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM solicitacoes
         WHERE ip = :ip AND criado_em > (NOW() - INTERVAL 1 HOUR)'
    );
    $stmt->execute([':ip' => $ip]);
    if ((int)$stmt->fetchColumn() >= (int)$config['limite_por_hora']) {
        resposta(429, false, 'Muitas tentativas. Tente novamente mais tarde.');
    }

    // Registra o pedido
    $stmt = $pdo->prepare(
        'INSERT INTO solicitacoes (email, aceitou_termos, ip)
         VALUES (:email, 1, :ip)'
    );
    $stmt->execute([':email' => $email, ':ip' => $ip]);
    $id = (int)$pdo->lastInsertId();
} catch (PDOException $e) {
    error_log('Erro no banco: ' . $e->getMessage());
    resposta(500, false, 'Erro interno. Tente novamente mais tarde.');
}

// ---------- E-mail ----------
$smtp = $config['smtp'];
$link = $config['kaggle_url'];

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $smtp['host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp['usuario'];
    $mail->Password   = $smtp['senha'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = (int)$smtp['porta'];
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($smtp['from'], $smtp['from_nome']);
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'Acesso ao dataset SteatoDB';
    $mail->Body    = '<p>Olá,</p>'
        . '<p>Obrigado pelo interesse no <strong>SteatoDB</strong>. '
        . 'Você pode acessar o dataset pelo link abaixo:</p>'
        . '<p><a href="' . htmlspecialchars($link, ENT_QUOTES, 'UTF-8') . '">'
        . htmlspecialchars($link, ENT_QUOTES, 'UTF-8') . '</a></p>'
        . '<p>Núcleo de Computação Aplicada - UFMA</p>';
    $mail->AltBody = "Olá,\n\nAcesse o dataset SteatoDB em:\n{$link}\n\n"
        . "O dataset destina-se exclusivamente à pesquisa.\n\nNúcleo de Computação Aplicada - UFMA";

    $mail->send();

    $pdo->prepare('UPDATE solicitacoes SET email_enviado = 1 WHERE id = :id')
        ->execute([':id' => $id]);

    resposta(200, true, 'Pronto! Enviamos o link de acesso para o seu e-mail.(verifique a sua caixa de spam)');
} catch (MailException $e) {
    error_log('Erro ao enviar e-mail: ' . $e->getMessage());
    resposta(500, false, 'Não foi possível enviar o e-mail agora. Tente novamente mais tarde.');
}
