<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\DieselMovement;
use App\Models\DieselTank;
use App\Models\DieselLocation;
use App\Models\DieselPinPermission;
use App\Models\DieselSecurityLevel;
use App\Models\Personal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests unitarios para el modelo DieselMovement
 * 
 * Ejecutar: php artisan test --filter=DieselMovementTest
 */
class DieselMovementTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $personal;
    protected $location;
    protected $tank;
    protected $securityLevel;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear datos de prueba
        $this->user = User::factory()->create();
        
        $this->personal = Personal::create([
            'nombre' => 'Juan',
            'apellido_paterno' => 'Pérez',
            'ci' => '12345678',
            'pin' => '1234',
        ]);

        $this->location = DieselLocation::create([
            'name' => 'Surtidor Test',
            'is_active' => true,
        ]);

        $this->tank = DieselTank::create([
            'name' => 'Tanque Test',
            'code' => 'T999',
            'location_id' => $this->location->id,
            'type' => 'FIXED',
            'capacity' => 1000.00,
            'current_stock' => 500.00,
            'current_meter' => 0.00,
        ]);

        $this->securityLevel = DieselSecurityLevel::create([
            'name' => 'Operador Test',
            'level_rank' => 1,
            'can_authorize_adjustments' => false,
        ]);

        DieselPinPermission::create([
            'personal_id' => $this->personal->id,
            'location_id' => $this->location->id,
            'security_level_id' => $this->securityLevel->id,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function puede_crear_movimiento_de_entrada()
    {
        $movement = DieselMovement::createMovement([
            'type' => 'ENTRY',
            'date' => now(),
            'tank_id' => $this->tank->id,
            'location_id' => $this->location->id,
            'meter_start' => 0.00,
            'meter_end' => 100.00,
            'supplier_id' => null, // Podríamos crear un supplier, pero es opcional para el test
            'unit_price' => 1.50,
            'user_id' => $this->user->id,
            'authorized_by_pin_id' => $this->personal->id,
        ]);

        $this->assertDatabaseHas('diesel_movements', [
            'id' => $movement->id,
            'type' => 'ENTRY',
            'liters' => 100.00,
        ]);

        // Verificar que el stock se incrementó
        $this->tank->refresh();
        $this->assertEquals(600.00, $this->tank->current_stock);
    }

    /** @test */
    public function puede_crear_movimiento_de_salida()
    {
        $machine = \App\Models\DieselMachine::create([
            'code' => 'TEST01',
            'name' => 'Máquina Test',
            'is_active' => true,
        ]);

        $jobType = \App\Models\DieselJobType::create([
            'name' => 'Test Job',
            'is_active' => true,
        ]);

        $movement = DieselMovement::createMovement([
            'type' => 'EXIT',
            'date' => now(),
            'tank_id' => $this->tank->id,
            'location_id' => $this->location->id,
            'meter_start' => 0.00,
            'meter_end' => 50.00,
            'machine_id' => $machine->id,
            'job_type_id' => $jobType->id,
            'hour_meter' => 100.0,
            'user_id' => $this->user->id,
            'authorized_by_pin_id' => $this->personal->id,
        ]);

        $this->assertDatabaseHas('diesel_movements', [
            'id' => $movement->id,
            'type' => 'EXIT',
            'liters' => 50.00,
        ]);

        // Verificar que el stock se decrementó
        $this->tank->refresh();
        $this->assertEquals(450.00, $this->tank->current_stock);
    }

    /** @test */
    public function no_permite_salida_si_no_hay_stock_suficiente()
    {
        $machine = \App\Models\DieselMachine::create([
            'code' => 'TEST02',
            'name' => 'Máquina Test 2',
            'is_active' => true,
        ]);

        $jobType = \App\Models\DieselJobType::create([
            'name' => 'Test Job 2',
            'is_active' => true,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Stock insuficiente');

        DieselMovement::createMovement([
            'type' => 'EXIT',
            'date' => now(),
            'tank_id' => $this->tank->id,
            'location_id' => $this->location->id,
            'meter_start' => 0.00,
            'meter_end' => 1000.00, // Más de lo que hay disponible (500L)
            'machine_id' => $machine->id,
            'job_type_id' => $jobType->id,
            'hour_meter' => 100.0,
            'user_id' => $this->user->id,
            'authorized_by_pin_id' => $this->personal->id,
        ]);
    }

    /** @test */
    public function valida_permiso_de_pin()
    {
        $personalSinPermiso = Personal::create([
            'nombre' => 'Sin Permiso',
            'apellido_paterno' => 'Usuario',
            'ci' => '99999999',
            'pin' => '9999',
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('no tiene permiso para operar');

        DieselMovement::createMovement([
            'type' => 'ENTRY',
            'date' => now(),
            'tank_id' => $this->tank->id,
            'location_id' => $this->location->id,
            'meter_start' => 0.00,
            'meter_end' => 100.00,
            'unit_price' => 1.50,
            'user_id' => $this->user->id,
            'authorized_by_pin_id' => $personalSinPermiso->id, // No tiene permiso
        ]);
    }

    /** @test */
    public function calcula_litros_automaticamente()
    {
        $movement = DieselMovement::createMovement([
            'type' => 'ENTRY',
            'date' => now(),
            'tank_id' => $this->tank->id,
            'location_id' => $this->location->id,
            'meter_start' => 1000.00,
            'meter_end' => 1250.50,
            // NO enviamos 'liters', debe calcularlo automáticamente
            'unit_price' => 1.50,
            'user_id' => $this->user->id,
            'authorized_by_pin_id' => $this->personal->id,
        ]);

        $this->assertEquals(250.50, $movement->liters);
    }

    /** @test */
    public function puede_anular_movimiento()
    {
        // Crear un auditor que puede anular
        $auditor = Personal::create([
            'nombre' => 'Auditor',
            'apellido_paterno' => 'Test',
            'ci' => '88888888',
            'pin' => '8888',
        ]);

        $auditorLevel = DieselSecurityLevel::create([
            'name' => 'Auditor',
            'level_rank' => 3,
            'can_authorize_adjustments' => true,
        ]);

        DieselPinPermission::create([
            'personal_id' => $auditor->id,
            'location_id' => $this->location->id,
            'security_level_id' => $auditorLevel->id,
            'is_active' => true,
        ]);

        // Crear movimiento
        $movement = DieselMovement::createMovement([
            'type' => 'ENTRY',
            'date' => now(),
            'tank_id' => $this->tank->id,
            'location_id' => $this->location->id,
            'meter_start' => 0.00,
            'meter_end' => 100.00,
            'unit_price' => 1.50,
            'user_id' => $this->user->id,
            'authorized_by_pin_id' => $this->personal->id,
        ]);

        // Verificar stock después de entrada
        $this->tank->refresh();
        $this->assertEquals(600.00, $this->tank->current_stock);

        // Anular el movimiento
        $movement->voidMovement('Error en digitación', $auditor->id);

        // Verificar que se marcó como anulado
        $this->assertEquals('VOID', $movement->status);

        // Verificar que el stock se reversó
        $this->tank->refresh();
        $this->assertEquals(500.00, $this->tank->current_stock);
    }

    /** @test */
    public function actualiza_medidor_del_tanque()
    {
        $movement = DieselMovement::createMovement([
            'type' => 'ENTRY',
            'date' => now(),
            'tank_id' => $this->tank->id,
            'location_id' => $this->location->id,
            'meter_start' => 1000.00,
            'meter_end' => 1100.00,
            'unit_price' => 1.50,
            'user_id' => $this->user->id,
            'authorized_by_pin_id' => $this->personal->id,
        ]);

        $this->tank->refresh();
        $this->assertEquals(1100.00, $this->tank->current_meter);
    }
}
