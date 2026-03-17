<!DOCTYPE html>
<html lang="en">
<header>
    <title>Redis testing</title>
</header>
<body>
<h1>Test for Redis</h1>
<pre>
@php
    use Illuminate\Support\Facades\Redis;

    $img = Redis::get('ogu');

//    var_dump($imgfile);
    echo "<img src='data:image/jpeg;base64, $img' />";
@endphp
</pre>
</body>
</html>
