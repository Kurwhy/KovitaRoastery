<?php

namespace App\Exceptions;

use RuntimeException;

class MidtransNotConfiguredException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Pembayaran QRIS belum dikonfigurasi.');
    }
}
