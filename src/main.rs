// Entry point for non-wasm
#[cfg(not(target_arch = "wasm32"))]
#[tokio::main]
async fn main() {
    run().await;
}

use three_d::*;

pub async fn run() {
    let window = Window::new(WindowSettings {
        title: "Le Fishe".to_string(),
        max_size: Some((1280, 720)),
        ..Default::default()
    })
    .unwrap();
    let context = window.gl();

    let mut camera = Camera::new_perspective(
        window.viewport(),
        vec3(10.0, 10.0, 10.0),
        vec3(0.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        degrees(45.0),
        0.0001,
        10.0,
    );
    let mut orbit = OrbitControl::new(vec3(0.0, 0.0, 0.0), 0.0001, 100.0);

    let scene =
        three_d_asset::io::load_and_deserialize_async("./textures/high_detailed_fish/scene.gltf")
            .await
            .unwrap();

    let mut fish = Model::<PhysicalMaterial>::new(&context, &scene).unwrap();
    fish.iter_mut().for_each(|m| {
        m.material.render_states.cull = Cull::Back;
        // m.set_transformation(Mat4::from_angle_x(degrees(-90.0)));
    });

    let ambient_light = AmbientLight::new(&context, 0.4, Color::WHITE);
    let mut directional_light = DirectionalLight::new(
        &context,
        10.0,
        Color::new_opaque(204, 178, 127),
        &vec3(0.0, -1.0, -1.0),
    );
    directional_light.generate_shadow_map(1024, &fish);
    // Bounding boxes
    let mut aabb = AxisAlignedBoundingBox::EMPTY;
    let mut bounding_boxes = Vec::new();
    for geometry in &fish {
        bounding_boxes.push(Gm::new(
            BoundingBox::new_with_thickness(&context, geometry.aabb(), 0.5),
            ColorMaterial {
                color: Color::RED,
                ..Default::default()
            },
        ));
        aabb.expand_with_aabb(&geometry.aabb());
    }
    bounding_boxes.push(Gm::new(
        BoundingBox::new_with_thickness(&context, aabb, 3.0),
        ColorMaterial {
            color: Color::BLACK,
            ..Default::default()
        },
    ));

    let mut gui = three_d::GUI::new(&context);
    let mut bounding_box_enabled = false;
    let mut spin = 0.0;
    window.render_loop(move |mut frame_input| {
        let mut panel_width = 0.0;
        gui.update(
            &mut frame_input.events,
            frame_input.accumulated_time,
            frame_input.viewport,
            frame_input.device_pixel_ratio,
            |gui_context| {
                use three_d::egui::*;
                SidePanel::left("side_panel").show(gui_context, |ui| {
                    ui.heading("Debug Panel");

                    ui.checkbox(&mut bounding_box_enabled, "Bounding boxes");

                    ui.add(egui::Slider::new(&mut spin, 0.0..=360.0))
                });
                panel_width = gui_context.used_rect().width();
            },
        );

        orbit.handle_events(&mut camera, &mut frame_input.events);

        let viewport = Viewport {
            x: (panel_width as f64 * frame_input.device_pixel_ratio) as i32,
            y: 0,
            width: frame_input.viewport.width
                - (panel_width as f64 * frame_input.device_pixel_ratio) as u32,
            height: frame_input.viewport.height,
        };
        camera.set_viewport(viewport);

        for part in fish.iter_mut() {
            part.set_transformation(Mat4::from_angle_y(degrees(spin)));
        }

        // draw
        frame_input
            .screen()
            .clear(ClearState::color_and_depth(0.8, 0.8, 0.7, 1.0, 1.0))
            .write(|| {
                for object in fish.into_iter().filter(|o| camera.in_frustum(&o.aabb())) {
                    object.render(&camera, &[&ambient_light, &directional_light]);
                }
                if bounding_box_enabled {
                    for bounding_box in bounding_boxes.iter() {
                        bounding_box.render(&camera, &[]);
                    }
                }
                gui.render();
            });

        FrameOutput::default()
    });
}
