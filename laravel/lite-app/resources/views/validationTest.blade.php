<!DOCTYPE html>
<html lang="en">
<header>
    <title>Validation rules testing</title>
</header>
<body>
<h1>Test for validation rules</h1>
<pre>
@php
    use App\Http\Resources\UserProfileResource;
    use App\Models\Artist;
    use App\Models\UserProfile;

//    var_dump(new UserProfileResource(UserProfile::find(11)));

    $stringify = function (string $s): string {
        return "'".$s."'";
    };

    function compactList($list, $stringfc)
    {
        if (! is_null($list)) {
            return '['.implode(', ', array_map($stringfc, $list)).']';
        }

        return null;
    }

    $data = ['feur' => ['foo', 'bar']];

    $d2 = $data;

    $d2['feur'] = compactList($data['feur'], $stringify);

    print_r($d2);

//    $artistName = 'yoaSobi';
//    var_dump(Artist::whereRaw('LOWER(artist_name) = LOWER(?)', trim(strtolower($artistName)))->get()->isEmpty());
@endphp
</pre>
</body>
</html>
