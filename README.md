# AdminControl

Una aplicación web diseñada para digitalizar y centralizar las operaciones de la recepción de un edificio de departamentos. Permite gestionar en tiempo real el registro de visitas, la recepción de deliveries y la asignación de estacionamientos, mejorando la seguridad y eficiencia.

[**Ver Demo en Vivo**](https://admincontrol-37268.web.app/)

## Características Principales

*   Registro de visitas con autocompletado para visitas frecuentes.
*   Gestión de estacionamientos de visita en tiempo real.
*   Registro de deliveries (paquetería, correspondencia).
*   Autenticación de usuarios (recepcionistas/administradores).
*   Despliegue continuo automatizado con GitHub Actions.

## Tecnologías Utilizadas

*   **Frontend:** React, TypeScript, Vite
*   **Estilos:** CSS Modules
*   **Backend y Base de Datos:** Firebase (Firestore, Authentication)
*   **Enrutamiento:** React Router
*   **Internacionalización:** i18next

## Instalación y Uso Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/NachoJorquera/gestion-edificio.git
    ```
2.  **Instalar dependencias:**
    ```bash
    cd gestion-edificio
    npm install
    ```
3.  **Ejecutar la aplicación:**
    ```bash
    npm run dev
    ```

## Despliegue

El proyecto está desplegado en Firebase Hosting. El despliegue se realiza de forma automática en cada push a la rama `main` mediante GitHub Actions.

## Autor

*   **Ignacio Jorquera Contreras**
    *   GitHub: [@NachoJorquera](https://github.com/NachoJorquera)
    *   LinkedIn: [Ignacio Jorquera](https://www.linkedin.com/in/ignacio-jorquera-32a5691a7)

## Licencia

Este proyecto está bajo la Licencia MIT.