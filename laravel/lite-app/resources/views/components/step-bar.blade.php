@props(['currentStep' => 1])

@php
    $steps = [1 => 'Genres', 2 => 'Artistes', 3 => 'Préférences', 4 => 'Récap'];
@endphp

<div class="w-full py-6">
    <div class="flex items-center justify-between relative max-w-2xl mx-auto">
        <div class="progress-bar-line"></div>
        @foreach($steps as $num => $text)
            <div class="flex flex-col items-center flex-1 relative"> 
                <div class="step-circle {{ $currentStep >= $num ? 'active-circle' : 'inactive-circle' }}">
                    {{ $num }}
                </div>
                <span class="step-label">
                    {{ $text }}
                </span>
            </div>
        @endforeach
    </div>
</div>