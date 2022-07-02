---
title: Encryption
---

## Introduction

Voltis supports a range of different AES encryption ciphers which are using the `openssl` library to perform secure encryption for you. It is recommended you use the Voltis encrypters for data encryption and generate a secure key before you deploy your application.

For encryptions ciphers which are using the `CBC` mode, they are validated using a message authentication code (MAC) to ensure data authenticity and that nothing was changed during decryption. If you are using `GCM` the data authentication is handled automatically and a secure cryptographically strong initialisation vector is generated using `random_bytes()` along with a 16 bit tag value.

Current supported encryption ciphers are:

- AES-128-CBC & AES-256-CBC
- AES-128-GCM & AES-256-GCM

Support for `libsodium` is coming.

:::caution
You should make sure you have generated an encryption key by running the `php voltis key:generate` command, a backup of the current key is created but please keep all encryption keys safe.
:::

## Configuration

You can find the configuration for encryption inside `/config/main.php` where you should make sure you have a secure encryption key generated, which respects the required cipher key length depending on which cipher you are using. You can use `php voltis key:gen` to build an encryption key for you which uses PHP's secure `random_bytes()` method.

## Encrypting Data

### Encryption Helper

You have a few ways to access the encryption service, the quickest being using the encrypt helper:

```php
$data = "Luke's secret note!";

$encrypted = encrypt($data);
```

The `encrypt()` method also allows you to turn off serialization by passing `false` as the second argument.

### Encryption Facade

You can also use the available encryption Facade to access the encrypt method:

```php
use Voltis\Encryption\Facade\Crypt;

$data = ['name' => 'Luke Embrey!'];

$encrypted = Crypt::encrypt($data);
```

Again, `encrypt()` also allows you to turn off serialization by passing `false` as the second argument.

### String Encryption

If you just want to encrypt a normal string without serialization, you can use:

```php
$data = "Luke Embrey!";

$encrypted = Crypt::encryptString($data);
```

## Decrypting Data

### Decryption Helper

```php
$decrypted = decrypt($encrypted);
```

If you don't want to unserialize your encrypted data, `decrypt()` allows you to turn this off by passing `false` as the second argument.

### Decryption Facade

```php
use Voltis\Encryption\Facade\Crypt;

$decrypted = Crypt::decrypt($encrypted);
```

:::note
If you want to not unserialize your encrypted data, `decrypt()` allows you to turn this off by passing `false` as the second argument.
:::

### String Decryption

```php
$decrypted = Crypt::decryptString($encrypted);
```

Decryption without serialization by default.

## Encryption & Decryption Example

During encryption and decryption you can wrap your calls inside try-catch blocks to handle any errors during the process. For example, you can handle such Exceptions like when the MAC does not match, JSON payload encode and decode errors or invalid or incorrectly formatted payload data.

```php
use Voltis\Encryption\Exception\EncryptionException;
use Voltis\Encryption\Exception\DecryptionException;

try
{
    $encrypted = encrypt($plainData);
}
catch (EncryptionException $e)
{
    //...
}

try
{
    $decrypted = decrypt($encryptedData);
}
catch (DecryptException $e)
{
    //...
}
```

## Getting the Encryption Key

If you want to get the encryption key that is being used to perform encryption, you can by using the `Crypt` Facade:

```php
$rawKey = Crypt::getEncryptionKey();

$base64Key = Crypt::getEncryptionKey($decode = false);
```

By not passing anything to this method, the key is automatically decoded from `base64` for you but if you don't want the key to be decoded, then pass `false` to the method.