# Sección 7: Git y Control de Versiones

### 1. Comando para crear una rama llamada `feature/filtro-por-sede` desde `main`
```bash
git checkout -b feature/filtro-por-sede main
```
*Explicación:* El flag `-b` crea la rama nueva y automáticamente hace un *checkout* (cambia a esa rama). El último argumento asegura que se crea apuntando específicamente al estado de la rama `main`, independientemente de en qué rama te encuentres actualmente. En versiones recientes de Git también se puede usar `git switch -c feature/filtro-por-sede main`.

### 2. Comando para hacer commit con un mensaje descriptivo que siga conventional commits
```bash
git commit -m "feat(estudiantes): agregar filtrado de listado por sede para usuarios OPERADOR"
```
*Explicación:* Sigue el estándar Conventional Commits (`tipo(ámbito): descripción`). Usamos `feat:` porque estamos agregando una nueva funcionalidad (feature). Si estuviéramos arreglando un bug usaríamos `fix:`. El ámbito `(estudiantes)` indica qué parte del código se vio afectada.

### 3. Comando para subir esa rama al remoto
```bash
git push -u origin feature/filtro-por-sede
```
*Explicación:* El comando sube los cambios locales al remoto (llamado `origin`). El flag `-u` (o `--set-upstream`) es crucial la primera vez, ya que vincula la rama local con la nueva rama remota. Esto permite que futuros `git push` o `git pull` en esta rama se ejecuten sin tener que especificar el origen o el nombre de la rama.

### 4. Proceso para crear un Pull Request y qué información incluir
**Proceso:**
1. Tras subir la rama con el código (`git push`), ir a la plataforma (GitHub, GitLab, Bitbucket).
2. Hacer clic en el botón "Compare & pull request" que suele aparecer automáticamente, o ir a la pestaña Pull Requests y seleccionar `Nueva PR`.
3. Seleccionar `main` (o `develop`) como rama base, y `feature/filtro-por-sede` como rama a fusionar (compare).

**Información que incluiría en la descripción:**
- **Contexto/Objetivo:** ¿Qué problema resuelve este PR? (Ej: "Implementa el requisito de seguridad donde los operadores solo pueden ver estudiantes de su sede").
- **Ticket asociado:** Link al issue o ticket de Jira/Trello (Ej: "Closes #45").
- **Cambios principales:** Lista breve de los archivos o lógicas clave tocadas.
- **Cómo probarlo (Testing):** Instrucciones paso a paso para el QA o el revisor (Ej: "1. Loguéate como operador. 2. Ve a /estudiantes. 3. Verifica que no existan IDs de otra sede").
- **Checklist:** ¿Pasan los tests? ¿Pasa el linter? ¿Se actualizó la documentación?

### 5. ¿Qué harías si al hacer pull de `main` hay conflictos con tu rama?
Si estoy en mi rama (`feature/filtro-por-sede`) y ejecuto `git pull origin main` (o `git merge main` habiendo actualizado main localmente) y hay conflictos, seguiría estos pasos:

1. **Identificar los archivos:** Git me dirá qué archivos tienen conflictos marcándolos como `unmerged`. Puedo verificarlos con `git status`.
2. **Revisar los marcadores de conflicto:** Abriría los archivos conflictivos en mi editor (ej: VSCode). Buscaría los marcadores `<<<<<<< HEAD` (mi código actual), `=======` (el separador) y `>>>>>>> main` (el código que viene de main).
3. **Resolver (Decidir):** Analizaría el código de ambas partes. Para cada conflicto, decidiría si me quedo con mi código, con el código de `main`, o si escribo una solución combinada que integre ambas lógicas correctamente.
4. **Limpiar:** Me aseguraría de borrar todos los marcadores (`<<<<<<<`, `=======`, `>>>>>>>`).
5. **Marcar como resuelto y confirmar:**
   ```bash
   git add <archivo-resuelto>
   # Repetir para todos los archivos con conflicto
   git commit -m "Merge branch 'main' into feature/filtro-por-sede (conflictos resueltos)"
   ```
6. **Verificar:** Correría los tests o levantaría la aplicación localmente para garantizar que la fusión no rompió nada antes de hacer `git push`.
